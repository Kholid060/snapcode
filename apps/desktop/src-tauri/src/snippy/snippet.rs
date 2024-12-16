use std::{collections::HashMap, fs, io, path::PathBuf, sync::Mutex};

use regex::Regex;
use serde::{ser::SerializeStruct, Deserialize, Serialize, Serializer};
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

use crate::common::stringify;

use super::document;

#[derive(Deserialize, sqlx::FromRow, Clone, Debug)]
pub struct SnippetPlaceholderItem {
    end: usize,
    start: usize,
    name: String,
}
impl Serialize for SnippetPlaceholderItem {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("SnippetPlaceholderItem", 3)?;
        s.serialize_field("end", &self.end)?;
        s.serialize_field("name", &self.name)?;
        s.serialize_field("start", &self.start)?;

        s.end()
    }
}

pub fn extract_snippet_placeholders(
    content: &str,
) -> Result<Vec<SnippetPlaceholderItem>, Box<dyn std::error::Error>> {
    let regex = Regex::new(r"\[\[(\w+)\]\]")?;
    Ok(regex
        .find_iter(content)
        .map(|entry| SnippetPlaceholderItem {
            end: entry.end(),
            start: entry.start(),
            name: entry.as_str().to_owned(),
        })
        .collect())
}

pub fn replace_snippet_placeholders<'a>(
    content: &'a mut String,
    placeholders: &Vec<SnippetPlaceholderItem>,
    placeholders_value: &HashMap<String, String>,
) -> &'a String {
    for placeholder in placeholders.iter().rev() {
        let value = placeholders_value
            .get(&placeholder.name)
            .unwrap_or(&placeholder.name);
        content.replace_range(placeholder.start..placeholder.end, value);
    }

    content
}
