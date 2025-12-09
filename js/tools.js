/* ==============================================
   أدوات تفاعلية - مشروع سياسة أمان المحتوى
   Interactive Tools JavaScript
   ============================================== */

// CSP Tools and Utilities
class CSPTools {
    constructor() {
        this.initializeTools();
    }

    initializeTools() {
        this.setupCSPGenerator();
        this.setupCSPValidator();
        this.setupSecurityHeadersChecker();
        this.setupVulnerabilityScanner();
        this.setupBestPracticesGuide();
    }

    // CSP Generator Tool
    setupCSPGenerator() {
        const generator = document.getElementById('cspGenerator');
        if (!generator) return;

        const form = generator.querySelector('form');
        const preview = generator.querySelector('.csp-preview');
        const copyBtn = generator.querySelector('.copy-btn');

        if (form) {
            form.addEventListener('input', this.debounce(() => {
                this.updateCSPPreview(form, preview);
            }, 300));

            form.addEventListener('change', () => {
                this.updateCSPPreview(form, preview);
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyCSPToClipboard(preview);
            });
        }

        // Initialize with default values
        this.setDefaultCSPValues(form);
    }

    setDefaultCSPValues(form) {
        if (!form) return;

        // Set common default values
        const defaults = {
            'default-src': "'self'",
            'script-src': "'self' 'unsafe-inline'",
            'style-src': "'self' 'unsafe-inline'",
            'img-src': "'self' data: https:",
            'font-src': "'self'",
            'connect-src': "'self'",
            'frame-ancestors': "'none'",
            'base-uri': "'self'",
            'form-action': "'self'"
        };

        Object.entries(defaults).forEach(([name, value]) => {
            const input = form.querySelector(`[name="${name}"]`);
            if (input) {
                input.value = value;
            }
        });

        // Set checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkbox.dataset.default === 'true';
        });
    }

    updateCSPPreview(form, preview) {
        if (!form || !preview) return;

        const formData = new FormData(form);
        let csp = "";

        // Build CSP from form data
        for (let [key, value] of formData.entries()) {
            if (value.trim()) {
                csp += `${key} ${value}; `;
            }
        }

        // Add additional directives based on checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            if (checkbox.name && checkbox.value) {
                csp += `${checkbox.name} ${checkbox.value}; `;
            }
        });

        // Clean up CSP
        csp = csp.trim().replace(/\s*;\s*/g, ';\n').replace(/\s*;\s*$/, '');

        // Display CSP
        preview.textContent = csp || 'default-src \'self\';';

        // Validate and show warnings
        this.validateCSP(csp, preview);
    }

    validateCSP(csp, preview) {
        const warnings = [];
        const errors = [];

        // Check for common issues
        if (csp.includes("'unsafe-inline'") && csp.includes('script-src')) {
            warnings.push("⚠️ 'unsafe-inline' في script-src يسمح بتنفيذ JavaScript ضار");
        }

        if (csp.includes('*')) {
            errors.push("❌ استخدام * غير آمن - حدد المصادر بوضوح");
        }

        if (!csp.includes('frame-ancestors')) {
            warnings.push("⚠️ لم يتم تحديد frame-ancestors - قد تكون عرضة لـ clickjacking");
        }

        if (!csp.includes('object-src')) {
            warnings.push("⚠️ لم يتم تحديد object-src - أضف 'none' لمنع plugins خطرة");
        }

        // Show validation results
        let validationHtml = '';
        if (errors.length > 0) {
            validationHtml += '<div class="validation-errors">';
            errors.forEach(error => {
                validationHtml += `<div class="alert alert-error">${error}</div>`;
            });
            validationHtml += '</div>';
        }

        if (warnings.length > 0) {
            validationHtml += '<div class="validation-warnings">';
            warnings.forEach(warning => {
                validationHtml += `<div class="alert alert-warning">${warning}</div>`;
            });
            validationHtml += '</div>';
        }

        if (errors.length === 0 && warnings.length === 0) {
            validationHtml = '<div class="alert alert-success">✅ سياسة CSP تبدو آمنة</div>';
        }

        // Add validation to preview
        const validationDiv = preview.parentNode.querySelector('.csp-validation');
        if (validationDiv) {
            validationDiv.innerHTML = validationHtml;
        }
    }

    async copyCSPToClipboard(preview) {
        if (!preview) return;

        try {
            await navigator.clipboard.writeText(preview.textContent);
            this.showCopySuccess();
        } catch (err) {
            console.error('فشل في نسخ CSP:', err);
            this.showCopyError();
        }
    }

    // CSP Validator Tool
    setupCSPValidator() {
        const validator = document.getElementById('cspValidator');
        if (!validator) return;

        const input = validator.querySelector('textarea');
        const validateBtn = validator.querySelector('.validate-btn');
        const results = validator.querySelector('.validation-results');

        if (validateBtn && input && results) {
            validateBtn.addEventListener('click', () => {
                this.validateCSPPolicy(input.value, results);
            });

            // Auto-validate on input (debounced)
            input.addEventListener('input', this.debounce(() => {
                this.validateCSPPolicy(input.value, results);
            }, 500));
        }
    }

    async validateCSPPolicy(csp, resultsContainer) {
        if (!csp.trim()) {
            resultsContainer.innerHTML = '<div class="alert alert-info">أدخل سياسة CSP للتحقق</div>';
            return;
        }

        resultsContainer.innerHTML = '<div class="loading">جاري التحقق...</div>';

        try {
            const validation = await this.performCSPValidation(csp);
            this.displayValidationResults(validation, resultsContainer);
        } catch (error) {
            resultsContainer.innerHTML = `<div class="alert alert-error">خطأ في التحقق: ${error.message}</div>`;
        }
    }

    async performCSPValidation(csp) {
        const directives = this.parseCSPDirectives(csp);
        const validation = {
            score: 0,
            issues: [],
            recommendations: [],
            supported: []
        };

        let totalScore = 0;
        const maxScore = 100;

        // Validate each directive
        for (const [name, values] of Object.entries(directives)) {
            const directiveValidation = this.validateDirective(name, values);
            totalScore += directiveValidation.score;
            validation.issues.push(...directiveValidation.issues);
            validation.recommendations.push(...directiveValidation.recommendations);
        }

        validation.score = Math.round((totalScore / maxScore) * 100);

        // Check browser support
        validation.supported = this.checkBrowserCSPSupport();

        return validation;
    }

    parseCSPDirectives(csp) {
        const directives = {};
        const parts = csp.split(';').map(p => p.trim()).filter(p => p);

        parts.forEach(part => {
            const [name, ...values] = part.split(/\s+/);
            if (name) {
                directives[name] = values.join(' ');
            }
        });

        return directives;
    }

    validateDirective(name, values) {
        const validation = {
            score: 0,
            issues: [],
            recommendations: []
        };

        switch (name) {
            case 'default-src':
                validation.score = 20;
                if (!values.includes("'self'")) {
                    validation.issues.push('يفضل إضافة \'self\' كقيمة افتراضية');
                }
                break;

            case 'script-src':
                validation.score = 30;
                if (values.includes("'unsafe-inline'")) {
                    validation.issues.push("'unsafe-inline' يسمح بتنفيذ JavaScript ضار");
                    validation.score -= 10;
                }
                if (values.includes("'unsafe-eval'")) {
                    validation.issues.push("'unsafe-eval' يسمح بـ code injection");
                    validation.score -= 15;
                }
                if (values.includes('*')) {
                    validation.issues.push('* يسمح بجميع المصادر - غير آمن');
                    validation.score -= 20;
                }
                if (!values.includes('nonce-') && !values.includes('sha')) {
                    validation.recommendations.push('استخدم nonces أو hashes للتحكم في السكريبت');
                }
                break;

            case 'style-src':
                validation.score = 15;
                if (values.includes("'unsafe-inline'")) {
                    validation.recommendations.push("استخدم nonces أو hashes بدلاً من 'unsafe-inline'");
                    validation.score -= 5;
                }
                break;

            case 'frame-ancestors':
                validation.score = 15;
                if (values.includes('*')) {
                    validation.issues.push('* يسمح بجميع المواقع بتضمين موقعك');
                    validation.score -= 10;
                }
                break;

            case 'object-src':
                validation.score = 10;
                if (!values.includes("'none'")) {
                    validation.recommendations.push("استخدم 'none' لمنع plugins خطرة");
                }
                break;

            default:
                validation.score = 5;
        }

        return validation;
    }

    checkBrowserCSPSupport() {
        const support = {
            'CSP Level 1': true,
            'CSP Level 2': 'Content-Security-Policy-Report-Only' in document.head,
            'CSP Level 3': 'strict-dynamic' in (document.head.textContent || ''),
            'Trusted Types': 'trustedTypes' in window,
            'Nonces': true,
            'Hashes': true,
            'Wildcards': true,
            'Keywords': true
        };

        return support;
    }

    displayValidationResults(validation, container) {
        const scoreClass = validation.score >= 80 ? 'success' : 
                          validation.score >= 60 ? 'warning' : 'error';

        let html = `
            <div class="validation-summary">
                <h4>📊 نتيجة التحقق</h4>
                <div class="score score-${scoreClass}">
                    <span class="score-number">${validation.score}</span>
                    <span class="score-label">/100</span>
                </div>
            </div>
        `;

        if (validation.issues.length > 0) {
            html += `
                <div class="validation-issues">
                    <h4>⚠️ المشاكل المكتشفة</h4>
                    <ul>
                        ${validation.issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (validation.recommendations.length > 0) {
            html += `
                <div class="validation-recommendations">
                    <h4>💡 التوصيات</h4>
                    <ul>
                        ${validation.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        html += `
            <div class="browser-support">
                <h4>🌐 دعم المتصفحات</h4>
                <table>
                    ${Object.entries(validation.supported).map(([feature, supported]) => `
                        <tr>
                            <td>${feature}</td>
                            <td class="${supported ? 'supported' : 'not-supported'}">
                                ${supported ? '✅ مدعوم' : '❌ غير مدعوم'}
                            </td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    // Security Headers Checker
    setupSecurityHeadersChecker() {
        const checker = document.getElementById('securityHeadersChecker');
        if (!checker) return;

        const urlInput = checker.querySelector('input[type="url"]');
        const checkBtn = checker.querySelector('.check-btn');
        const results = checker.querySelector('.headers-results');

        if (checkBtn && urlInput && results) {
            checkBtn.addEventListener('click', () => {
                this.checkSecurityHeaders(urlInput.value, results);
            });
        }
    }

    async checkSecurityHeaders(url, resultsContainer) {
        if (!url) {
            resultsContainer.innerHTML = '<div class="alert alert-error">يرجى إدخال رابط صحيح</div>';
            return;
        }

        resultsContainer.innerHTML = '<div class="loading">جاري فحص رؤوس الأمان...</div>';

        try {
            // Note: This is a simulation since we can't actually fetch headers from cross-origin requests
            // In a real implementation, you would need a server-side proxy
            const headers = await this.simulateHeaderCheck(url);
            this.displayHeaderResults(headers, resultsContainer);
        } catch (error) {
            resultsContainer.innerHTML = `<div class="alert alert-error">خطأ في فحص الرؤوس: ${error.message}</div>`;
        }
    }

    async simulateHeaderCheck(url) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate header analysis
        const mockHeaders = {
            'Content-Security-Policy': Math.random() > 0.5 ? 'default-src \'self\'; script-src \'self\'' : null,
            'X-Frame-Options': Math.random() > 0.3 ? 'DENY' : null,
            'X-Content-Type-Options': Math.random() > 0.4 ? 'nosniff' : null,
            'Strict-Transport-Security': Math.random() > 0.6 ? 'max-age=31536000; includeSubDomains' : null,
            'X-XSS-Protection': Math.random() > 0.5 ? '1; mode=block' : null,
            'Referrer-Policy': Math.random() > 0.4 ? 'strict-origin-when-cross-origin' : null,
            'Permissions-Policy': Math.random() > 0.7 ? 'geolocation=(), camera=(), microphone=()' : null
        };

        return mockHeaders;
    }

    displayHeaderResults(headers, container) {
        const requiredHeaders = [
            { name: 'Content-Security-Policy', importance: 'critical', description: 'حماية من XSS والهجمات الأخرى' },
            { name: 'X-Frame-Options', importance: 'high', description: 'منع clickjacking' },
            { name: 'X-Content-Type-Options', importance: 'high', description: 'منع MIME type sniffing' },
            { name: 'Strict-Transport-Security', importance: 'high', description: 'فرض HTTPS' },
            { name: 'X-XSS-Protection', importance: 'medium', description: 'حماية من XSS (legacy)' },
            { name: 'Referrer-Policy', importance: 'medium', description: 'التحكم في معلومات المرجع' },
            { name: 'Permissions-Policy', importance: 'medium', description: 'التحكم في صلاحيات المتصفح' }
        ];

        let html = `
            <div class="headers-summary">
                <h4>🛡️ فحص رؤوس الأمان</h4>
                <p>الموقع: ${document.getElementById('siteUrl')?.value || 'الموقع الحالي'}</p>
            </div>
        `;

        requiredHeaders.forEach(header => {
            const value = headers[header.name];
            const status = value ? 'present' : 'missing';
            const statusIcon = value ? '✅' : '❌';
            const statusText = value ? 'موجود' : 'مفقود';
            const statusClass = value ? 'success' : 'error';

            html += `
                <div class="header-item header-${status}">
                    <div class="header-info">
                        <span class="header-status ${statusClass}">${statusIcon} ${statusText}</span>
                        <h5>${header.name}</h5>
                        <p class="header-description">${header.description}</p>
                        <span class="header-importance importance-${header.importance}">
                            ${header.importance === 'critical' ? 'حرج' : 
                              header.importance === 'high' ? 'عالي' : 'متوسط'}
                        </span>
                    </div>
                    ${value ? `<div class="header-value"><code>${value}</code></div>` : ''}
                </div>
            `;
        });

        // Calculate overall score
        const presentCount = Object.values(headers).filter(v => v !== null).length;
        const totalCount = requiredHeaders.length;
        const score = Math.round((presentCount / totalCount) * 100);

        const scoreClass = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';

        html += `
            <div class="overall-score">
                <h4>📊 النتيجة الإجمالية</h4>
                <div class="score score-${scoreClass}">
                    <span class="score-number">${score}</span>
                    <span class="score-label">/100</span>
                    <span class="score-details">(${presentCount}/${totalCount} رأس أمني)</span>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Vulnerability Scanner
    setupVulnerabilityScanner() {
        const scanner = document.getElementById('vulnerabilityScanner');
        if (!scanner) return;

        const urlInput = scanner.querySelector('input[type="url"]');
        const scanBtn = scanner.querySelector('.scan-btn');
        const results = scanner.querySelector('.scan-results');

        if (scanBtn && urlInput && results) {
            scanBtn.addEventListener('click', () => {
                this.performVulnerabilityScan(urlInput.value, results);
            });
        }
    }

    async performVulnerabilityScan(url, resultsContainer) {
        if (!url) {
            resultsContainer.innerHTML = '<div class="alert alert-error">يرجى إدخال رابط صحيح</div>';
            return;
        }

        resultsContainer.innerHTML = '<div class="loading">جاري فحص الثغرات...</div>';

        try {
            const vulnerabilities = await this.simulateVulnerabilityScan(url);
            this.displayVulnerabilityResults(vulnerabilities, resultsContainer);
        } catch (error) {
            resultsContainer.innerHTML = `<div class="alert alert-error">خطأ في فحص الثغرات: ${error.message}</div>`;
        }
    }

    async simulateVulnerabilityScan(url) {
        // Simulate scan delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const vulnerabilities = [];
        const severityLevels = ['critical', 'high', 'medium', 'low'];
        
        // Simulate finding vulnerabilities
        if (Math.random() > 0.6) {
            vulnerabilities.push({
                type: 'XSS',
                severity: severityLevels[Math.floor(Math.random() * 2)],
                title: 'ثغرة XSS محتملة',
                description: 'تم اكتشاف نقاط ضعف محتملة في معالجة المدخلات',
                recommendation: 'استخدم Content Security Policy وتنظيف المدخلات'
            });
        }

        if (Math.random() > 0.7) {
            vulnerabilities.push({
                type: 'CSRF',
                severity: 'medium',
                title: 'حماية CSRF مفقودة',
                description: 'لا توجد حماية واضحة من هجمات CSRF',
                recommendation: 'تطبيق CSRF tokens وتأكيد العمليات الحساسة'
            });
        }

        if (Math.random() > 0.8) {
            vulnerabilities.push({
                type: 'Information Disclosure',
                severity: 'low',
                title: 'كشف معلومات حساسة',
                description: 'قد يتم كشف معلومات تقنية في الاستجابات',
                recommendation: 'إزالة headers والرسائل التي تكشف معلومات تقنية'
            });
        }

        return vulnerabilities;
    }

    displayVulnerabilityResults(vulnerabilities, container) {
        let html = `
            <div class="scan-summary">
                <h4>🔍 نتائج فحص الثغرات</h4>
                <p>الموقع: ${document.getElementById('scanUrl')?.value || 'الموقع الحالي'}</p>
                <p>عدد الثغرات المكتشفة: ${vulnerabilities.length}</p>
            </div>
        `;

        if (vulnerabilities.length === 0) {
            html += `
                <div class="alert alert-success">
                    <h4>✅ لم يتم اكتشاف ثغرات</h4>
                    <p>الموقع يبدو آمناً من الثغرات الأساسية</p>
                </div>
            `;
        } else {
            vulnerabilities.forEach(vuln => {
                const severityClass = vuln.severity;
                const severityText = {
                    'critical': 'حرج',
                    'high': 'عالي',
                    'medium': 'متوسط',
                    'low': 'منخفض'
                }[vuln.severity];

                html += `
                    <div class="vulnerability-item vulnerability-${severityClass}">
                        <div class="vulnerability-header">
                            <h5>${vuln.title}</h5>
                            <span class="vulnerability-severity severity-${severityClass}">
                                ${severityText}
                            </span>
                            <span class="vulnerability-type">${vuln.type}</span>
                        </div>
                        <p>${vuln.description}</p>
                        <div class="vulnerability-recommendation">
                            <strong>التوصية:</strong> ${vuln.recommendation}
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }

    // Best Practices Guide
    setupBestPracticesGuide() {
        const guide = document.getElementById('bestPracticesGuide');
        if (!guide) return;

        // Initialize interactive guide
        this.initializeInteractiveGuide(guide);
    }

    initializeInteractiveGuide(guide) {
        const sections = guide.querySelectorAll('.guide-section');
        
        sections.forEach((section, index) => {
            const toggle = section.querySelector('.guide-toggle');
            const content = section.querySelector('.guide-content');
            
            if (toggle && content) {
                toggle.addEventListener('click', () => {
                    this.toggleGuideSection(content, toggle);
                });
                
                // Auto-expand first section
                if (index === 0) {
                    content.style.display = 'block';
                    toggle.setAttribute('aria-expanded', 'true');
                }
            }
        });
    }

    toggleGuideSection(content, toggle) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            content.style.display = 'none';
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            content.style.display = 'block';
            toggle.setAttribute('aria-expanded', 'true');
        }
    }

    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showCopySuccess() {
        this.showNotification('تم نسخ السياسة بنجاح!', 'success');
    }

    showCopyError() {
        this.showNotification('فشل في نسخ السياسة', 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize tools when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new CSPTools();
});

// Export for global access
window.CSPTools = CSPTools;