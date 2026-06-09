// Helpers for the rich-text "content" field on work experience entries.

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Resolve the HTML to display/edit for an experience entry.
// Prefers the new rich-text `content` field; falls back to the old
// description + bullets so existing CVs keep their data.
export function getExpContentHtml(exp) {
  if (exp && typeof exp.content === 'string' && exp.content.trim()) {
    return exp.content;
  }
  let html = '';
  if (exp?.description && exp.description.trim()) {
    html += `<p>${escapeHtml(exp.description)}</p>`;
  }
  const bullets = (exp?.bullets || []).filter((b) => b && b.trim());
  if (bullets.length) {
    html += `<ul>${bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`;
  }
  return html;
}

// True if there is anything to render for this entry.
export function hasExpContent(exp) {
  return Boolean(getExpContentHtml(exp).trim());
}
