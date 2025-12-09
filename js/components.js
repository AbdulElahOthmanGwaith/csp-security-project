/* ==============================================
   مكونات تفاعلية - مشروع سياسة أمان المحتوى
   Interactive Components JavaScript
   ============================================== */

// Example Tabs Functionality
function showExampleTab(tabName) {
    // Hide all example content
    const exampleContents = document.querySelectorAll('.example-content');
    exampleContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    const tabButtons = document.querySelectorAll('.examples-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected example content
    const selectedContent = document.getElementById(tabName + '-example');
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Add active class to clicked tab
    const clickedTab = event.target;
    clickedTab.classList.add('active');
    
    // Announce change for screen readers
    CSPProject.announceMessage(`تم التبديل إلى ${tabName} example`);
}

// Guide Section Functionality
function showSection(sectionName) {
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const elementPosition = targetSection.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
        
        // Highlight the section
        targetSection.style.border = '2px solid var(--primary-500)';
        targetSection.style.borderRadius = '12px';
        targetSection.style.padding = 'var(--space-lg)';
        targetSection.style.margin = 'var(--space-lg)';
        targetSection.style.background = 'rgba(0, 224, 213, 0.05)';
        
        setTimeout(() => {
            targetSection.style.border = '';
            targetSection.style.borderRadius = '';
            targetSection.style.padding = '';
            targetSection.style.margin = '';
            targetSection.style.background = '';
        }, 2000);
        
        CSPProject.announceMessage(`تم الانتقال إلى قسم ${sectionName}`);
    }
}

// Modal Management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input in modal
        const firstInput = modal.querySelector('input, button, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        CSPProject.announceMessage('تم فتح نافذة منبثقة');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        CSPProject.announceMessage('تم إغلاق النافذة المنبثقة');
    }
}

// CSP Builder Modal
function openCSPBuilder() {
    openModal('cspBuilderModal');
    initializeCSPBuilder();
}

function closeCSPBuilder() {
    closeModal('cspBuilderModal');
}

// CSP Builder Functionality
function initializeCSPBuilder() {
    const builderTabs = document.querySelectorAll('.builder-tabs .tab-btn');
    const builderTabContents = document.querySelectorAll('.builder-tab');
    
    builderTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.textContent.toLowerCase().replace(/\s+/g, '-');
            showBuilderTab(tabName);
        });
    });
    
    // Initialize form handlers
    initializeBuilderForm();
    generateInitialCSP();
}

function showBuilderTab(tabName) {
    // Hide all builder tabs
    builderTabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all builder tabs
    const builderTabButtons = document.querySelectorAll('.builder-tabs .tab-btn');
    builderTabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected builder tab
    const selectedTab = document.getElementById(tabName + '-builder');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

function initializeBuilderForm() {
    const inputs = document.querySelectorAll('#cspBuilderModal input, #cspBuilderModal textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', CSPProject.debounce(generateCSPFromForm, 300));
    });
    
    const checkboxes = document.querySelectorAll('#cspBuilderModal input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', generateCSPFromForm);
    });
}

function generateInitialCSP() {
    // Set default values
    document.getElementById('jsSources').value = "'self' 'unsafe-inline'";
    document.getElementById('cssSources').value = "'self' 'unsafe-inline'";
    document.getElementById('imgSources').value = "'self' data: https:";
    document.getElementById('fontSources').value = "'self'";
    document.getElementById('connectSources').value = "'self'";
    
    // Set default checkboxes
    document.getElementById('blockMixedContent').checked = true;
    document.getElementById('upgradeInsecure').checked = true;
    document.getElementById('frameAncestors').checked = false;
    
    generateCSPFromForm();
}

function generateCSPFromForm() {
    const jsSources = document.getElementById('jsSources').value || "'self'";
    const cssSources = document.getElementById('cssSources').value || "'self'";
    const imgSources = document.getElementById('imgSources').value || "'self'";
    const fontSources = document.getElementById('fontSources').value || "'self'";
    const connectSources = document.getElementById('connectSources').value || "'self'";
    
    const blockMixedContent = document.getElementById('blockMixedContent').checked;
    const upgradeInsecure = document.getElementById('upgradeInsecure').checked;
    const frameAncestors = document.getElementById('frameAncestors').checked;
    const strictDynamic = document.getElementById('strictDynamic').checked;
    
    let csp = "default-src 'self';\n";
    csp += `script-src ${jsSources};\n`;
    csp += `style-src ${cssSources};\n`;
    csp += `img-src ${imgSources};\n`;
    csp += `font-src ${fontSources};\n`;
    csp += `connect-src ${connectSources};\n`;
    
    if (strictDynamic) {
        csp += "script-src 'strict-dynamic';\n";
    }
    
    if (frameAncestors) {
        csp += "frame-ancestors 'self';\n";
    } else {
        csp += "frame-ancestors 'none';\n";
    }
    
    csp += "base-uri 'self';\n";
    csp += "form-action 'self';\n";
    
    if (blockMixedContent) {
        csp += "block-all-mixed-content;\n";
    }
    
    if (upgradeInsecure) {
        csp += "upgrade-insecure-requests;\n";
    }
    
    // Update the generated CSP display
    const generatedCSP = document.getElementById('generatedCSP');
    if (generatedCSP) {
        generatedCSP.textContent = csp;
    }
    
    // Run tests
    runCSPTests(csp);
}

function copyGeneratedCSP() {
    const generatedCSP = document.getElementById('generatedCSP');
    if (generatedCSP) {
        CSPProject.copyToClipboard(generatedCSP.textContent);
        showCopyFeedback();
    }
}

function runCSPTests(csp) {
    const testResults = document.querySelector('.test-results');
    if (!testResults) return;
    
    // Clear existing tests
    testResults.innerHTML = '';
    
    const tests = [
        {
            name: 'Default-src Policy',
            check: () => csp.includes('default-src'),
            status: csp.includes('default-src') ? 'success' : 'error'
        },
        {
            name: 'Script-src Validation',
            check: () => csp.includes('script-src'),
            status: csp.includes('script-src') ? 'success' : 'error'
        },
        {
            name: 'Unsafe-inline Warning',
            check: () => !csp.includes("'unsafe-inline'") || csp.includes('script-src'),
            status: csp.includes("'unsafe-inline'") ? 'warning' : 'success'
        },
        {
            name: 'Frame Protection',
            check: () => csp.includes('frame-ancestors'),
            status: csp.includes('frame-ancestors') ? 'success' : 'warning'
        },
        {
            name: 'Mixed Content Protection',
            check: () => csp.includes('block-all-mixed-content'),
            status: csp.includes('block-all-mixed-content') ? 'success' : 'warning'
        }
    ];
    
    tests.forEach(test => {
        const testItem = document.createElement('div');
        testItem.className = 'test-item';
        
        const statusIcon = document.createElement('span');
        statusIcon.className = `test-status ${test.status}`;
        statusIcon.textContent = test.status === 'success' ? '✓' : test.status === 'warning' ? '⚠' : '✗';
        
        const statusText = document.createElement('span');
        statusText.textContent = test.name;
        
        testItem.appendChild(statusIcon);
        testItem.appendChild(statusText);
        testResults.appendChild(testItem);
    });
}

// CSP Tester Modal
function openCSPTester() {
    showModalWithContent('cspTesterModal', `
        <div class="modal-header">
            <h3>🔍 اختبار سياسة أمان المحتوى</h3>
            <button class="modal-close" onclick="closeModal('cspTesterModal')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="test-input-section">
                <h4>أدخل سياسة CSP للاختبار:</h4>
                <textarea id="cspToTest" placeholder="الصق سياسة CSP هنا..." rows="8"></textarea>
                <button class="btn btn-primary" onclick="analyzeCSP()">تحليل السياسة</button>
            </div>
            <div id="testResults" class="test-results" style="margin-top: 20px;"></div>
        </div>
    `);
}

function analyzeCSP() {
    const cspInput = document.getElementById('cspToTest');
    const results = document.getElementById('testResults');
    
    if (!cspInput || !results) return;
    
    const csp = cspInput.value.trim();
    if (!csp) {
        results.innerHTML = '<div class="status-message error">يرجى إدخال سياسة CSP للاختبار</div>';
        return;
    }
    
    results.innerHTML = '<div class="status-message loading"><div class="loading-spinner"></div>جاري تحليل السياسة...</div>';
    
    setTimeout(() => {
        const analysis = performCSPAnalysis(csp);
        displayCSPAnalysis(analysis, results);
    }, 1000);
}

function performCSPAnalysis(csp) {
    const directives = csp.split(';').map(d => d.trim()).filter(d => d);
    const analysis = {
        directives: [],
        securityScore: 0,
        recommendations: [],
        vulnerabilities: []
    };
    
    directives.forEach(directive => {
        const [name, ...values] = directive.split(/\s+/);
        const directiveAnalysis = analyzeDirective(name, values.join(' '));
        analysis.directives.push(directiveAnalysis);
        analysis.securityScore += directiveAnalysis.score;
    });
    
    // Overall recommendations
    if (!csp.includes('default-src')) {
        analysis.recommendations.push('إضافة default-src لتحديد السياسة الافتراضية');
    }
    if (csp.includes("'unsafe-inline'") && csp.includes('script-src')) {
        analysis.vulnerabilities.push("'unsafe-inline' في script-src يسمح بتنفيذ JavaScript ضار");
    }
    if (!csp.includes('frame-ancestors')) {
        analysis.recommendations.push('إضافة frame-ancestors لمنع clickjacking');
    }
    if (!csp.includes('object-src')) {
        analysis.recommendations.push('إضافة object-src \'none\' لمنع plugins خطرة');
    }
    
    analysis.securityScore = Math.min(100, Math.max(0, analysis.securityScore));
    
    return analysis;
}

function analyzeDirective(name, values) {
    const directive = {
        name: name,
        values: values,
        score: 0,
        issues: [],
        recommendations: []
    };
    
    switch (name) {
        case 'default-src':
            directive.score = 20;
            if (!values.includes("'self'")) {
                directive.issues.push("يفضل إضافة 'self' كقيمة افتراضية");
                directive.score -= 5;
            }
            break;
            
        case 'script-src':
            directive.score = 30;
            if (values.includes("'unsafe-inline'")) {
                directive.issues.push("'unsafe-inline' يسمح بتنفيذ JavaScript ضار");
                directive.score -= 10;
            }
            if (values.includes("'unsafe-eval'")) {
                directive.issues.push("'unsafe-eval' يسمح بـ code injection");
                directive.score -= 10;
            }
            if (values.includes('*')) {
                directive.issues.push("* يسمح بجميع المصادر");
                directive.score -= 15;
            }
            break;
            
        case 'style-src':
            directive.score = 15;
            if (values.includes("'unsafe-inline'")) {
                directive.recommendations.push("استخدم nonces أو hashes بدلاً من 'unsafe-inline'");
                directive.score -= 5;
            }
            break;
            
        case 'frame-ancestors':
            directive.score = 15;
            if (values.includes('*')) {
                directive.issues.push("* يسمح بجميع المواقع بتضمين موقعك");
                directive.score -= 10;
            }
            break;
            
        default:
            directive.score = 5;
    }
    
    return directive;
}

function displayCSPAnalysis(analysis, container) {
    const scoreColor = analysis.securityScore >= 80 ? 'success' : 
                      analysis.securityScore >= 60 ? 'warning' : 'error';
    
    container.innerHTML = `
        <div class="analysis-summary">
            <h4>📊 نتيجة التحليل:</h4>
            <div class="security-status ${scoreColor}">
                <div class="security-status-icon"></div>
                <span>النتيجة: ${analysis.securityScore}/100</span>
            </div>
        </div>
        
        <div class="directives-analysis">
            <h4>📋 تحليل التوجيهات:</h4>
            ${analysis.directives.map(directive => `
                <div class="directive-item">
                    <h5>${directive.name}</h5>
                    <p><strong>القيم:</strong> ${directive.values}</p>
                    <p><strong>النقاط:</strong> ${directive.score}/30</p>
                    ${directive.issues.length > 0 ? `
                        <div class="security-alert error">
                            <div class="security-alert-icon">⚠️</div>
                            <div>
                                <strong>مشاكل:</strong>
                                <ul>${directive.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
                            </div>
                        </div>
                    ` : ''}
                    ${directive.recommendations.length > 0 ? `
                        <div class="security-alert warning">
                            <div class="security-alert-icon">💡</div>
                            <div>
                                <strong>توصيات:</strong>
                                <ul>${directive.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        ${analysis.vulnerabilities.length > 0 ? `
            <div class="security-alert error">
                <div class="security-alert-icon">🚨</div>
                <div>
                    <strong>ثغرات أمنية مكتشفة:</strong>
                    <ul>${analysis.vulnerabilities.map(vuln => `<li>${vuln}</li>`).join('')}</ul>
                </div>
            </div>
        ` : ''}
        
        ${analysis.recommendations.length > 0 ? `
            <div class="security-alert warning">
                <div class="security-alert-icon">💡</div>
                <div>
                    <strong>توصيات التحسين:</strong>
                    <ul>${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>
                </div>
            </div>
        ` : ''}
    `;
}

// Security Scanner Modal
function openSecurityScanner() {
    showModalWithContent('securityScannerModal', `
        <div class="modal-header">
            <h3>🛡️ ماسح الأمان الشامل</h3>
            <button class="modal-close" onclick="closeModal('securityScannerModal')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="scanner-input-section">
                <h4>أدخل رابط الموقع للفحص:</h4>
                <input type="url" id="siteToScan" placeholder="https://example.com" />
                <button class="btn btn-primary" onclick="scanWebsite()">بدء الفحص</button>
            </div>
            <div id="scanResults" class="scan-results" style="margin-top: 20px;"></div>
        </div>
    `);
}

function scanWebsite() {
    const urlInput = document.getElementById('siteToScan');
    const results = document.getElementById('scanResults');
    
    if (!urlInput || !results) return;
    
    const url = urlInput.value.trim();
    if (!url) {
        results.innerHTML = '<div class="status-message error">يرجى إدخال رابط صحيح</div>';
        return;
    }
    
    if (!CSPProject.isValidUrl(url)) {
        results.innerHTML = '<div class="status-message error">رابط غير صحيح</div>';
        return;
    }
    
    results.innerHTML = '<div class="status-message loading"><div class="loading-spinner"></div>جاري فحص الموقع...</div>';
    
    // Simulate scanning process
    setTimeout(() => {
        const scanResults = performSecurityScan(url);
        displayScanResults(scanResults, results);
    }, 2000);
}

function performSecurityScan(url) {
    // Simulate security scan results
    return {
        url: url,
        timestamp: new Date().toLocaleString('ar-SA'),
        cspStatus: Math.random() > 0.5 ? 'secure' : 'warning',
        headersStatus: Math.random() > 0.7 ? 'secure' : 'warning',
        xssVulnerability: Math.random() > 0.8,
        mixedContent: Math.random() > 0.6,
        score: Math.floor(Math.random() * 40) + 60,
        findings: [
            {
                type: 'CSP',
                severity: 'medium',
                description: 'سياسة أمان المحتوى موجودة ولكن تحتاج تحسين',
                recommendation: 'استخدم strict-dynamic وإزالة unsafe-inline'
            },
            {
                type: 'Headers',
                severity: 'low',
                description: 'بعض رؤوس الأمان مفقودة',
                recommendation: 'أضف X-Frame-Options و X-Content-Type-Options'
            }
        ]
    };
}

function displayScanResults(results, container) {
    const overallStatus = results.score >= 80 ? 'success' : 
                         results.score >= 60 ? 'warning' : 'error';
    
    container.innerHTML = `
        <div class="scan-summary">
            <h4>🔍 نتائج الفحص:</h4>
            <div class="security-status ${overallStatus}">
                <div class="security-status-icon"></div>
                <span>النتيجة الإجمالية: ${results.score}/100</span>
            </div>
            <p><strong>الموقع:</strong> ${results.url}</p>
            <p><strong>وقت الفحص:</strong> ${results.timestamp}</p>
        </div>
        
        <div class="scan-findings">
            <h4>📋 النتائج المفصلة:</h4>
            ${results.findings.map(finding => `
                <div class="finding-item">
                    <div class="finding-header">
                        <span class="finding-type">${finding.type}</span>
                        <span class="finding-severity ${finding.severity}">${finding.severity}</span>
                    </div>
                    <p>${finding.description}</p>
                    <p class="finding-recommendation"><strong>التوصية:</strong> ${finding.recommendation}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="scan-recommendations">
            <h4>🎯 التوصيات:</h4>
            <ul>
                <li>تطبيق سياسة CSP شاملة</li>
                <li>تفعيل HTTPS فقط</li>
                <li>إضافة رؤوس الأمان المطلوبة</li>
                <li>فحص دوري للثغرات الأمنية</li>
            </ul>
        </div>
    `;
}

// Code Analyzer Modal
function openCodeAnalyzer() {
    showModalWithContent('codeAnalyzerModal', `
        <div class="modal-header">
            <h3>🔬 محلل الكود الأمني</h3>
            <button class="modal-close" onclick="closeModal('codeAnalyzerModal')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="analyzer-input-section">
                <h4>أدخل كود JavaScript للتحليل:</h4>
                <textarea id="codeToAnalyze" placeholder="الصق كود JavaScript هنا..." rows="10"></textarea>
                <button class="btn btn-primary" onclick="analyzeCode()">تحليل الكود</button>
            </div>
            <div id="codeAnalysisResults" class="code-analysis-results" style="margin-top: 20px;"></div>
        </div>
    `);
}

function analyzeCode() {
    const codeInput = document.getElementById('codeToAnalyze');
    const results = document.getElementById('codeAnalysisResults');
    
    if (!codeInput || !results) return;
    
    const code = codeInput.value.trim();
    if (!code) {
        results.innerHTML = '<div class="status-message error">يرجى إدخال كود للتحليل</div>';
        return;
    }
    
    results.innerHTML = '<div class="status-message loading"><div class="loading-spinner"></div>جاري تحليل الكود...</div>';
    
    setTimeout(() => {
        const analysis = performCodeAnalysis(code);
        displayCodeAnalysis(analysis, results);
    }, 1500);
}

function performCodeAnalysis(code) {
    const issues = [];
    const recommendations = [];
    let securityScore = 100;
    
    // Check for XSS vulnerabilities
    if (code.includes('innerHTML') && !code.includes('DOMPurify')) {
        issues.push({
            type: 'XSS Risk',
            severity: 'high',
            description: 'استخدام innerHTML قد يؤدي إلى XSS',
            line: findLineWithIssue(code, 'innerHTML')
        });
        securityScore -= 20;
    }
    
    if (code.includes('eval(')) {
        issues.push({
            type: 'Code Injection',
            severity: 'critical',
            description: 'eval() يسمح بتنفيذ كود ضار',
            line: findLineWithIssue(code, 'eval')
        });
        securityScore -= 30;
    }
    
    if (code.includes('document.write')) {
        issues.push({
            type: 'XSS Risk',
            severity: 'medium',
            description: 'document.write يمكن أن يسبب XSS',
            line: findLineWithIssue(code, 'document.write')
        });
        securityScore -= 15;
    }
    
    // Check for good practices
    if (code.includes('trustedTypes') || code.includes('createPolicy')) {
        recommendations.push('ممتاز! استخدام Trusted Types للحماية من XSS');
        securityScore += 10;
    }
    
    if (code.includes('CSP') || code.includes('Content-Security-Policy')) {
        recommendations.push('جيد! تطبيق سياسة أمان المحتوى');
        securityScore += 5;
    }
    
    securityScore = Math.max(0, Math.min(100, securityScore));
    
    return {
        issues,
        recommendations,
        securityScore,
        summary: {
            totalLines: code.split('\n').length,
            securityIssues: issues.length,
            recommendations: recommendations.length
        }
    };
}

function findLineWithIssue(code, issue) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(issue)) {
            return i + 1;
        }
    }
    return null;
}

function displayCodeAnalysis(analysis, container) {
    const status = analysis.securityScore >= 80 ? 'success' : 
                  analysis.securityScore >= 60 ? 'warning' : 'error';
    
    container.innerHTML = `
        <div class="code-analysis-summary">
            <h4>📊 تحليل الكود:</h4>
            <div class="security-status ${status}">
                <div class="security-status-icon"></div>
                <span>نقاط الأمان: ${analysis.securityScore}/100</span>
            </div>
            <div class="analysis-stats">
                <p><strong>عدد الأسطر:</strong> ${analysis.summary.totalLines}</p>
                <p><strong>المشاكل الأمنية:</strong> ${analysis.summary.securityIssues}</p>
                <p><strong>التوصيات:</strong> ${analysis.summary.recommendations}</p>
            </div>
        </div>
        
        ${analysis.issues.length > 0 ? `
            <div class="code-issues">
                <h4>⚠️ المشاكل المكتشفة:</h4>
                ${analysis.issues.map(issue => `
                    <div class="code-issue">
                        <div class="issue-header">
                            <span class="issue-type">${issue.type}</span>
                            <span class="issue-severity ${issue.severity}">${issue.severity}</span>
                            ${issue.line ? `<span class="issue-line">السطر ${issue.line}</span>` : ''}
                        </div>
                        <p>${issue.description}</p>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${analysis.recommendations.length > 0 ? `
            <div class="code-recommendations">
                <h4>💡 التوصيات:</h4>
                ${analysis.recommendations.map(rec => `
                    <div class="recommendation-item">
                        <div class="recommendation-icon">✓</div>
                        <p>${rec}</p>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        <div class="code-suggestions">
            <h4>🚀 اقتراحات للتحسين:</h4>
            <ul>
                <li>استخدم DOMPurify لتنظيف HTML</li>
                <li>طبق Trusted Types للحماية المتقدمة</li>
                <li>تجنب eval() و innerHTML غير المنضبط</li>
                <li>استخدم Content Security Policy</li>
                <li>فحص المدخلات من المستخدمين</li>
            </ul>
        </div>
    `;
}

// Helper function to show modal with custom content
function showModalWithContent(modalId, content) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.innerHTML = content;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        const firstInput = modal.querySelector('input, button, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Initialize component event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modal close on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Initialize keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
});