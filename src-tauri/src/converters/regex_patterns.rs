use once_cell::sync::Lazy;
use regex::Regex;

// ===== BASIC HTML PATTERNS =====

pub static HTML_TAG: Lazy<Regex> = Lazy::new(|| Regex::new(r"<[^>]*>").unwrap());
pub static LINE_BREAKS: Lazy<Regex> = Lazy::new(|| Regex::new(r"<br\s*/?>").unwrap());
pub static MULTIPLE_SPACES: Lazy<Regex> = Lazy::new(|| Regex::new(r"[ \t]+").unwrap());
pub static MULTIPLE_NEWLINES: Lazy<Regex> = Lazy::new(|| Regex::new(r"\n{3,}").unwrap());

// ===== BLOCK ELEMENTS =====

pub static DIV_TAG: Lazy<Regex> = Lazy::new(|| Regex::new(r"</?div[^>]*>").unwrap());
pub static P_TAG: Lazy<Regex> = Lazy::new(|| Regex::new(r"<p[^>]*>(.*?)</p>").unwrap());
pub static P_CLOSE: Lazy<Regex> = Lazy::new(|| Regex::new(r"</p>").unwrap());
pub static HR_TAG: Lazy<Regex> = Lazy::new(|| Regex::new(r"<hr[^>]*>").unwrap());

// ===== HEADERS =====

pub static H1_TAG: Lazy<Regex> = Lazy::new(|| Regex::new(r"<h1[^>]*>(.*?)</h1>").unwrap());
pub static H2_TAG: Lazy<Regex> = Lazy::new(|| Regex::new(r"<h2[^>]*>(.*?)</h2>").unwrap());

// ===== LISTS =====

pub static UL_TAG: Lazy<Regex> = Lazy::new(|| Regex::new(r"<ul[^>]*>(.*?)</ul>").unwrap());
pub static OL_TAG: Lazy<Regex> = Lazy::new(|| Regex::new(r"<ol[^>]*>(.*?)</ol>").unwrap());
pub static LI_TAG: Lazy<Regex> = Lazy::new(|| Regex::new(r"<li[^>]*>(.*?)</li>").unwrap());
