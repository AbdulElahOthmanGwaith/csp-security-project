document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-csp');
    const cspResult = document.getElementById('csp-result');
    const copyBtn = document.getElementById('copy-csp-btn');
    
    // Enhanced CSP Generator with Advanced Options
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const defaultSrc = document.getElementById('default-src').value;
            const scriptSrcInput = document.getElementById('script-src').value;
            const scriptInline = document.getElementById('script-inline').checked;
            const scriptEval = document.getElementById('script-eval').checked;
            const strictMode = document.getElementById('strict-mode')?.checked || false;
            const trustedTypes = document.getElementById('trusted-types')?.checked || false;
            const reportTo = document.getElementById('report-to')?.value || '';
            
            let policy = '';
            
            if (strictMode) {
                // Strict CSP using nonce (recommended for 2026)
                policy = `default-src 'none'; `;
                policy += `script-src 'nonce-r4nd0m' 'strict-dynamic' https:; `;
                policy += `style-src 'nonce-r4nd0m' https:; `;
                policy += `img-src 'self' data: https:; `;
                policy += `font-src 'self' https://fonts.gstatic.com; `;
                policy += `connect-src 'self'; `;
                policy += `frame-ancestors 'none'; `;
                policy += `base-uri 'none'; `;
                policy += `form-action 'self'; `;
            } else {
                // Standard CSP
                policy = `default-src ${defaultSrc}; `;
                
                let scriptSrc = "script-src 'self'";
                if (scriptSrcInput) scriptSrc += ` ${scriptSrcInput}`;
                if (scriptInline) scriptSrc += " 'unsafe-inline'";
                if (scriptEval) scriptSrc += " 'unsafe-eval'";
                
                policy += `${scriptSrc}; `;
                
                // Add sensible defaults for other common directives
                policy += "style-src 'self' 'unsafe-inline'; ";
                policy += "img-src 'self' data: https:; ";
                policy += "font-src 'self' https://fonts.gstatic.com; ";
                policy += "connect-src 'self'; ";
                policy += "frame-ancestors 'none'; ";
                policy += "base-uri 'self'; ";
                policy += "form-action 'self'; ";
            }
            
            // Add Trusted Types if enabled (2026 security best practice)
            if (trustedTypes) {
                policy += "require-trusted-types-for 'script'; ";
                policy += "trusted-types default; ";
            }
            
            // Add Reporting API if specified
            if (reportTo) {
                policy += `report-to ${reportTo}; `;
            }
            
            // Remove trailing space and semicolon
            policy = policy.trim();
            if (policy.endsWith(';')) {
                policy = policy.slice(0, -1);
            }
            
            cspResult.textContent = `Content-Security-Policy: ${policy}`;
            
            // Add animation feedback
            cspResult.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            setTimeout(() => {
                cspResult.style.backgroundColor = 'transparent';
            }, 500);
            
            // Show copy button
            if (copyBtn) {
                copyBtn.style.display = 'inline-block';
            }
        });
    }
    
    // Copy to Clipboard Functionality
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = cspResult.textContent;
            
            // Use modern Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    // Show success feedback
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = '✓ تم النسخ!';
                    copyBtn.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
                    
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.style.backgroundColor = '';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    fallbackCopy(text);
                });
            } else {
                // Fallback for older browsers
                fallbackCopy(text);
            }
        });
    }
    
    // Fallback copy function for older browsers
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        // Show feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ تم النسخ!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }
    
    // Real-time Policy Preview
    const inputs = document.querySelectorAll('#default-src, #script-src, #script-inline, #script-eval, #strict-mode, #trusted-types, #report-to');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            // Auto-generate on input change (optional)
            // generateBtn.click();
        });
    });
});
