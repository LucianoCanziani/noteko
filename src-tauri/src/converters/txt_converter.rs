use super::regex_patterns::*;

pub fn html_to_text(html: &str) -> String {
    let mut text = html.to_string();

    // Convert lists to text
    text = convert_lists_to_text(&text);

    // Convert headers to text
    text = H1_TAG.replace_all(&text, "$1\n\n").to_string();
    text = H2_TAG.replace_all(&text, "$1\n\n").to_string();

    // Convert paragraphs
    text = P_TAG.replace_all(&text, "$1\n\n").to_string();
    text = P_CLOSE.replace_all(&text, "\n\n").to_string();

    // Convert divs to line breaks
    text = DIV_TAG.replace_all(&text, "\n").to_string();

    // Convert line breaks
    text = LINE_BREAKS.replace_all(&text, "\n").to_string();
    text = HR_TAG.replace_all(&text, "\n---\n").to_string();

    // Remove all remaining HTML tags
    text = HTML_TAG.replace_all(&text, "").to_string();

    // Decode HTML entities
    text = html_escape::decode_html_entities(&text).to_string();

    // Clean up whitespace
    text = MULTIPLE_SPACES.replace_all(&text, " ").to_string();
    text = MULTIPLE_NEWLINES.replace_all(&text, "\n\n").to_string();

    // Clean up whitespace on lines
    text = text
        .lines()
        .map(|line| line.trim())
        .collect::<Vec<_>>()
        .join("\n");

    text.trim().to_string()
}

fn convert_lists_to_text(html: &str) -> String {
    let mut text = html.to_string();

    // Convert unordered lists
    text = UL_TAG
        .replace_all(&text, |caps: &regex::Captures| {
            let list_content = &caps[1];
            let mut result = String::new();

            // Parses each item individually and adds a line jump
            for li_match in LI_TAG.find_iter(list_content) {
                let li_full = &list_content[li_match.start()..li_match.end()];
                if let Some(li_caps) = LI_TAG.captures(li_full) {
                    let li_text = li_caps.get(1).map_or("", |m| m.as_str()).trim();
                    if !li_text.is_empty() {
                        result.push_str(&format!("• {}\n", li_text));
                    }
                }
            }

            format!("\n{}\n", result.trim_end())
        })
        .to_string();

    // Convert ordered lists
    text = OL_TAG
        .replace_all(&text, |caps: &regex::Captures| {
            let list_content = &caps[1];
            let mut result = String::new();
            let mut counter = 1;

            // Parses each item individually and adds a line jump
            for li_match in LI_TAG.find_iter(list_content) {
                let li_full = &list_content[li_match.start()..li_match.end()];
                if let Some(li_caps) = LI_TAG.captures(li_full) {
                    let li_text = li_caps.get(1).map_or("", |m| m.as_str()).trim();
                    if !li_text.is_empty() {
                        result.push_str(&format!("{}. {}\n", counter, li_text));
                        counter += 1;
                    }
                }
            }

            format!("\n{}\n", result.trim_end())
        })
        .to_string();

    text
}

pub fn text_to_html(text: &str) -> String {
    let html = html_escape::encode_text(text).to_string();

    let paragraphs: Vec<&str> = html.split("\n\n").collect();

    if paragraphs.len() > 1 {
        let html_paragraphs: Vec<String> = paragraphs
            .iter()
            .filter(|p| !p.trim().is_empty())
            .map(|p| format!("<p>{}</p>", p.replace("\n", "<br>")))
            .collect();
        html_paragraphs.join("")
    } else {
        // Single paragraph
        format!("<p>{}</p>", html.replace("\n", "<br>"))
    }
}
