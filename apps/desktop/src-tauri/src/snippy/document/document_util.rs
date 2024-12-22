use path_slash::PathExt;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    sync::{mpsc, Arc},
    time::UNIX_EPOCH,
};
use walkdir::WalkDir;

use ignore::{WalkBuilder, WalkState};
use {
    grep_matcher::Matcher,
    grep_regex::{RegexMatcher, RegexMatcherBuilder},
    grep_searcher::sinks::UTF8,
    grep_searcher::Searcher,
};

use super::{
    DocumentFlatTree, DocumentFlatTreeItem, DocumentFlatTreeMetadataItem, SearchItemEntry,
    SnippetStoredMetadata,
};

pub fn get_document_flat_tree<P: AsRef<Path>>(
    base_dir: P,
    metadata_store: &Arc<tauri_plugin_store::Store<tauri::Wry>>,
) -> DocumentFlatTree {
    let mut flat_tree: HashMap<String, Vec<DocumentFlatTreeItem>> = HashMap::new();
    flat_tree.insert(String::from("__root"), vec![]);

    let mut tree_metadata: HashMap<String, DocumentFlatTreeMetadataItem> = HashMap::new();

    let mut ids: HashMap<String, String> = HashMap::new();
    let mut id: u32 = 0;

    for entry in WalkDir::new(&base_dir).into_iter() {
        if entry.is_err() {
            continue;
        }

        let entry = entry.unwrap();
        let name = entry.file_name().to_string_lossy().to_string();
        let Ok(metadata) = entry.metadata() else {
            continue;
        };

        let relative_path = entry.path().strip_prefix(&base_dir).unwrap();
        let item_key = relative_path.to_slash_lossy().to_string();
        if item_key.is_empty() {
            continue;
        }

        let item_id = match ids.get(&item_key) {
            Some(value) => value.clone(),
            None => {
                id += 1;
                let item_id = format!("item-{id}");
                ids.insert(item_key.clone(), item_id.clone());

                item_id
            }
        };
        let parent_key = match Path::new(&item_key)
            .parent()
            .map(|v| v.to_string_lossy().to_string())
        {
            Some(parent) if !parent.is_empty() => ids
                .entry(parent)
                .or_insert_with(|| {
                    id += 1;
                    format!("item-{id}")
                })
                .clone(),
            _ => String::from("__root"),
        };

        let mtime = match metadata.modified() {
            Ok(time) => time
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis(),
            Err(_) => 0,
        };
        let ext = if metadata.is_file() {
            relative_path
                .extension()
                .and_then(|val| val.to_str())
                .unwrap_or_default()
                .to_owned()
        } else {
            String::new()
        };

        let stored_metadata: Option<SnippetStoredMetadata> = match metadata_store.get(&item_key) {
            Some(value) => serde_json::from_value(value).unwrap_or(None),
            None => None,
        };

        tree_metadata.insert(
            item_id.clone(),
            DocumentFlatTreeMetadataItem {
                ext,
                name,
                mtime,
                path: item_key,
                id: item_id.clone(),
                is_dir: metadata.is_dir(),
                metadata: stored_metadata,
            },
        );

        let tree_item = DocumentFlatTreeItem {
            id: item_id,
            is_dir: metadata.is_dir(),
            parent_id: parent_key.clone(),
        };
        match flat_tree.get_mut(&parent_key) {
            Some(value) => {
                (*value).push(tree_item);
            }
            None => {
                flat_tree.insert(parent_key, vec![tree_item]);
            }
        };
    }

    DocumentFlatTree {
        flat_tree,
        metadata: tree_metadata,
    }
}

struct SearchMatcher {
    base_dir: PathBuf,
    matcher: RegexMatcher,
}
impl SearchMatcher {
    fn new(base_dir: PathBuf, search_term: &str) -> Result<Self, grep_regex::Error> {
        let matcher = RegexMatcherBuilder::new()
            .case_insensitive(true)
            .fixed_strings(true)
            .build(search_term)?;

        Ok(Self { matcher, base_dir })
    }

    fn get_item(&self, entry: Result<ignore::DirEntry, ignore::Error>) -> Option<SearchItemEntry> {
        if entry.is_err() {
            return None;
        }

        let entry = entry.unwrap();
        let is_file = entry.file_type().map(|val| val.is_file()).unwrap_or(true);
        if !is_file || entry.is_stdin() {
            return None;
        }

        let mut file_name = entry.file_name().to_string_lossy().to_string();
        let mut matches_filename = false;
        let _ = Searcher::new().search_slice(
            &self.matcher,
            entry.file_name().to_string_lossy().as_bytes(),
            UTF8(|_lnum, line| {
                let search_match = self.matcher.find(line.as_bytes())?.unwrap();
                file_name.replace_range(
                    search_match.start()..search_match.end(),
                    &format!(
                        "<mk>{}</mk>",
                        &file_name[search_match.start()..search_match.end()]
                    ),
                );
                matches_filename = true;

                Ok(true)
            }),
        );

        let file_path = entry.path();


        let mut contents: Vec<(u64, String)> = vec![];
        let _ = Searcher::new().search_path(
            &self.matcher,
            file_path,
            UTF8(|lnum, line| {
                if contents.len() >= 5 {
                    return Ok(false);
                }

                let search_match = self.matcher.find(line.as_bytes())?.unwrap();
                let mut content = line.to_string();

                content.replace_range(
                    search_match.start()..search_match.end(),
                    &format!(
                        "<mk>{}</mk>",
                        &line[search_match].to_string()
                    ),
                );
                contents.push((lnum, content));

                Ok(true)
            }),
        );

        if matches_filename || !contents.is_empty() {
            Some(SearchItemEntry {
                contents,
                name: file_name,
                path: file_path
                    .strip_prefix(&self.base_dir)
                    .unwrap()
                    .to_slash_lossy()
                    .to_string(),
            })
        } else {
            None
        }
    }
}

pub fn search_document<P: AsRef<Path>>(
    base_dir: P,
    search_term: &str,
) -> anyhow::Result<Vec<SearchItemEntry>> {
    if search_term.is_empty() {
        return Ok(vec![]);
    }

    let (sx, rx) = mpsc::channel();
    let matcher = SearchMatcher::new(base_dir.as_ref().to_path_buf(), search_term)?;

    WalkBuilder::new(&base_dir)
        .follow_links(false)
        .ignore(false)
        .build_parallel()
        .run(|| {
            let sx = sx.clone();
            let matcher = &matcher;

            Box::new(move |entry| {
                let Some(item) = matcher.get_item(entry) else {
                    return WalkState::Continue;
                };

                match sx.send(item) {
                    Ok(_) => WalkState::Continue,
                    Err(_) => WalkState::Quit,
                }
            })
        });
    drop(sx);

    Ok(rx.into_iter().collect())
}
