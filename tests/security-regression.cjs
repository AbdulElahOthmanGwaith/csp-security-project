const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { escapeHtml } = require('../js/security-utils.js');

assert.equal(
    escapeHtml('<img src=x onerror=alert(1)>"\'&'),
    '&lt;img src=x onerror=alert(1)&gt;&quot;&#39;&amp;'
);
assert.equal(escapeHtml(null), '');

const tools = fs.readFileSync(path.join(__dirname, '..', 'js', 'tools.js'), 'utf8');
for (const marker of [
    'SecurityUtils.escapeHtml(error)',
    'SecurityUtils.escapeHtml(error.message)',
    'SecurityUtils.escapeHtml(document.getElementById(\'siteUrl\')?.value',
    'SecurityUtils.escapeHtml(document.getElementById(\'scanUrl\')?.value',
    'SecurityUtils.escapeHtml(vuln.title)',
    'SecurityUtils.escapeHtml(vuln.description)',
    'SecurityUtils.escapeHtml(vuln.recommendation)'
]) {
    assert.ok(tools.includes(marker), `missing security guard: ${marker}`);
}

console.log('csp security regression tests passed');
