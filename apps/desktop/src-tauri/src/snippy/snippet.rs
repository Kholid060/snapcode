use regex::Regex;
use serde::{ser::SerializeStruct, Deserialize, Serialize, Serializer};

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
        let mut s = serializer.serialize_struct("SnippetPlaceholderItem", 2)?;
        s.serialize_field("end", &self.end)?;
        s.serialize_field("name", &self.name)?;
        s.serialize_field("start", &self.start)?;

        s.end()
    }
}

pub fn extract_snippet_placeholders(
    content: &String,
) -> Vec<SnippetPlaceholderItem> {
    let regex = Regex::new(r"\[\[(\w+)\]\]").unwrap();

    regex
        .find_iter(content)
        .map(|entry| SnippetPlaceholderItem {
            end: entry.end(),
            start: entry.start(),
            name: entry.as_str().to_owned(),
        })
        .collect()
}
