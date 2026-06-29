/**
 * Simple HTML sanitizer — only allows a safe subset of tags and attributes.
 * Used before rendering user-edited HTML content.
 */
const ALLOWED_TAGS = new Set([
  "b", "strong", "i", "em", "u",
  "br", "p", "span", "div",
]);

const ALLOWED_ATTRS = new Set([
  "style",
]);

const ALLOWED_STYLES = new Set([
  "font-size", "font-weight",
]);

function sanitizeStyle(style: string): string {
  return style
    .split(";")
    .map((s) => s.trim())
    .filter((rule) => {
      const prop = rule.split(":")[0]?.trim().toLowerCase();
      return prop && ALLOWED_STYLES.has(prop);
    })
    .join("; ");
}

export function sanitizeHtml(html: string): string {
  // Simple regex-based sanitizer — strips dangerous tags/attrs
  return html
    // Remove script, iframe, object, embed tags entirely
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    // Remove on* event handlers
    .replace(/\s+on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+on\w+\s*=\s*'[^']*'/gi, "")
    // Remove javascript: URLs
    .replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
    .replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'")
    // Sanitize style attributes
    .replace(/style\s*=\s*"([^"]*)"/gi, (_match, styles) => {
      const clean = sanitizeStyle(styles);
      return clean ? `style="${clean}"` : "";
    });
}
