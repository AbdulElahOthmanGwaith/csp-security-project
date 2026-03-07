document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-csp');
    const cspResult = document.getElementById('csp-result');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const defaultSrc = document.getElementById('default-src').value;
            const scriptSrcInput = document.getElementById('script-src').value;
            const scriptInline = document.getElementById('script-inline').checked;
            const scriptEval = document.getElementById('script-eval').checked;
            
            let policy = `default-src ${defaultSrc}; `;
            
            let scriptSrc = "script-src 'self'";
            if (scriptSrcInput) scriptSrc += ` ${scriptSrcInput}`;
            if (scriptInline) scriptSrc += " 'unsafe-inline'";
            if (scriptEval) scriptSrc += " 'unsafe-eval'";
            
            policy += `${scriptSrc}; `;
            
            // Add some sensible defaults for other common directives
            policy += "style-src 'self' 'unsafe-inline'; ";
            policy += "img-src 'self' data: https:; ";
            policy += "font-src 'self' https://fonts.gstatic.com; ";
            policy += "connect-src 'self'; ";
            policy += "frame-ancestors 'none'; ";
            policy += "base-uri 'self'; ";
            policy += "form-action 'self';";
            
            cspResult.textContent = `Content-Security-Policy: ${policy}`;
            
            // Add a subtle animation to the output box
            cspResult.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
            setTimeout(() => {
                cspResult.style.backgroundColor = 'transparent';
            }, 500);
        });
    }
});
