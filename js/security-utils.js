(function attachSecurityUtils(root, factory) {
    const utils = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = utils;
    }
    if (root) {
        root.SecurityUtils = utils;
    }
})(typeof window !== 'undefined' ? window : globalThis, function createSecurityUtils() {
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    return { escapeHtml };
});
