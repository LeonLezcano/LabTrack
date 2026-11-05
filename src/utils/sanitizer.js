/**
 * Sanitizer Zero-Sink DOM
 * Directiva Mandatoria AiAppFactory Standard
 */
export const Sanitizer = {
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  safeSetInnerHTML(element, rawHTML) {
    if (!element) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHTML, 'text/html');

    // Sanitizar elementos peligrosos
    const scripts = doc.querySelectorAll('script, iframe, object, embed');
    scripts.forEach(s => s.remove());

    // Sanitizar atributos en línea tipo onclick, onerror
    const all = doc.querySelectorAll('*');
    all.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
        if (['href', 'src', 'action'].includes(attr.name)) {
          const val = attr.value.trim().toLowerCase();
          if (val.startsWith('javascript:') || val.startsWith('data:') || val.startsWith('vbscript:')) {
            el.removeAttribute(attr.name);
          }
        }
      });
    });

    element.replaceChildren(...Array.from(doc.body.childNodes));
  },

  sanitizeURL(url) {
    if (!url) return '';
    const clean = String(url).trim();
    const lower = clean.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:text/html')) {
      return '#';
    }
    return clean;
  }
};
