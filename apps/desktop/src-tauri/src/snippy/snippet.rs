use std::collections::HashMap;
use crate::snippy;

pub fn replace_snippet_placeholders<'a>(
    content: &'a mut String,
    placeholders: &[snippy::document::SnippetPlaceholderItem],
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
