/**
 * محلل التهديدات بالذكاء الاصطناعي
 * AI-Powered Threat Analyzer
 * Real-time threat detection and analysis system
 */

class AIThreatAnalyzer {
    constructor() {
        this.threatPatterns = {
            xss: [
                /<script[^>]*>[\s\S]*?<\/script>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi,
                /<iframe[^>]*>/gi,
                /<object[^>]*>/gi,
                /<embed[^>]*>/gi
            ],
            injection: [
                /union\s+select/gi,
                /drop\s+table/gi,
                /insert\s+into/gi,
                /delete\s+from/gi,
                /--/gi,
                /;/gi,
                /\|/gi,
                /\bOR\b\s+1=1/gi,
                /\bAND\b\s+1=1/gi
            ],
            csrf: [
                /<form[^>]*method\s*=\s*["']?post["']?[^>]*>/gi,
                /<input[^>]*name\s*=\s*["']?_token["']?[^>]*>/gi,
                /<meta[^>]*name\s*=\s*["']?csrf-token["']?[^>]*>/gi
            ],
            clickjacking: [
                /<iframe[^>]*src\s*=\s*["']?https?:\/\//gi,
                /style\s*=\s*["']?position\s*:\s*absolute/gi,
                /z-index\s*:\s*\d+/gi
            ]
        };

        this.severityLevels = {
            critical: { score: 90, color: '#FF4444', label: 'حرج' },
            high: { score: 70, color: '#FF8800', label: 'عالي' },
            medium: { score: 40, color: '#FFAA00', label: 'متوسط' },
            low: { score: 20, color: '#FFDD00', label: 'منخفض' },
            info: { score: 10, color: '#44AA44', label: 'معلوماتي' }
        };

        this.analysisHistory = [];
        this.isAnalyzing = false;
    }

    /**
     * تحليل شامل للتهديدات في المحتوى
     * Comprehensive threat analysis in content
     */
    analyzeContent(content, source = 'unknown') {
        if (this.isAnalyzing) {
            return Promise.reject(new Error('تحليل正在进行中...'));
        }

        this.isAnalyzing = true;
        
        const analysisResult = {
            timestamp: new Date().toISOString(),
            source: source,
            threats: [],
            riskScore: 0,
            recommendations: [],
            details: {}
        };

        try {
            // تحليل أنماط XSS
            analysisResult.details.xss = this.analyzeXSS(content);
            
            // تحليل أنماط SQL Injection
            analysisResult.details.injection = this.analyzeInjection(content);
            
            // تحليل أنماط CSRF
            analysisResult.details.csrf = this.analyzeCSRF(content);
            
            // تحليل أنماط Clickjacking
            analysisResult.details.clickjacking = this.analyzeClickjacking(content);
            
            // تحليل المحتوى المشبوه
            analysisResult.details.suspicious = this.analyzeSuspiciousContent(content);
            
            // حساب درجة المخاطر الإجمالية
            analysisResult.riskScore = this.calculateOverallRisk(analysisResult.details);
            
            // تحديد التهديدات الرئيسية
            analysisResult.threats = this.identifyTopThreats(analysisResult.details);
            
            // توليد التوصيات
            analysisResult.recommendations = this.generateRecommendations(analysisResult.details);
            
            // حفظ في السجل
            this.analysisHistory.push(analysisResult);
            
            // الحفاظ على آخر 100 تحليل فقط
            if (this.analysisHistory.length > 100) {
                this.analysisHistory.shift();
            }

            return Promise.resolve(analysisResult);
            
        } catch (error) {
            console.error('خطأ في تحليل التهديدات:', error);
            return Promise.reject(error);
        } finally {
            this.isAnalyzing = false;
        }
    }

    /**
     * تحليل أنماط XSS
     * XSS pattern analysis
     */
    analyzeXSS(content) {
        const xssFindings = [];
        let riskScore = 0;

        this.threatPatterns.xss.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    xssFindings.push({
                        type: 'XSS',
                        pattern: pattern.toString(),
                        match: match.substring(0, 100),
                        severity: this.getSeverityByPattern('xss', index),
                        line: this.findLineNumber(content, match)
                    });
                    riskScore += this.getSeverityScore('xss', index);
                });
            }
        });

        return {
            findings: xssFindings,
            riskScore: Math.min(riskScore, 100),
            level: this.getRiskLevel(riskScore)
        };
    }

    /**
     * تحليل أنماط Injection
     * Injection pattern analysis
     */
    analyzeInjection(content) {
        const injectionFindings = [];
        let riskScore = 0;

        this.threatPatterns.injection.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    injectionFindings.push({
                        type: 'Injection',
                        pattern: pattern.toString(),
                        match: match.substring(0, 100),
                        severity: this.getSeverityByPattern('injection', index),
                        line: this.findLineNumber(content, match)
                    });
                    riskScore += this.getSeverityScore('injection', index);
                });
            }
        });

        return {
            findings: injectionFindings,
            riskScore: Math.min(riskScore, 100),
            level: this.getRiskLevel(riskScore)
        };
    }

    /**
     * تحليل أنماط CSRF
     * CSRF pattern analysis
     */
    analyzeCSRF(content) {
        const csrfFindings = [];
        let riskScore = 0;

        this.threatPatterns.csrf.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    csrfFindings.push({
                        type: 'CSRF',
                        pattern: pattern.toString(),
                        match: match.substring(0, 100),
                        severity: this.getSeverityByPattern('csrf', index),
                        line: this.findLineNumber(content, match)
                    });
                    riskScore += this.getSeverityScore('csrf', index);
                });
            }
        });

        return {
            findings: csrfFindings,
            riskScore: Math.min(riskScore, 100),
            level: this.getRiskLevel(riskScore)
        };
    }

    /**
     * تحليل أنماط Clickjacking
     * Clickjacking pattern analysis
     */
    analyzeClickjacking(content) {
        const clickjackingFindings = [];
        let riskScore = 0;

        this.threatPatterns.clickjacking.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    clickjackingFindings.push({
                        type: 'Clickjacking',
                        pattern: pattern.toString(),
                        match: match.substring(0, 100),
                        severity: this.getSeverityByPattern('clickjacking', index),
                        line: this.findLineNumber(content, match)
                    });
                    riskScore += this.getSeverityScore('clickjacking', index);
                });
            }
        });

        return {
            findings: clickjackingFindings,
            riskScore: Math.min(riskScore, 100),
            level: this.getRiskLevel(riskScore)
        };
    }

    /**
     * تحليل المحتوى المشبوه العام
     * General suspicious content analysis
     */
    analyzeSuspiciousContent(content) {
        const suspiciousFindings = [];
        const suspiciousPatterns = [
            { pattern: /eval\s*\(/gi, severity: 'critical', description: 'استخدام eval() خطير' },
            { pattern: /innerHTML\s*=/gi, severity: 'high', description: 'استخدام innerHTML قد يؤدي لـ XSS' },
            { pattern: /document\.write/gi, severity: 'high', description: 'document.write يمكن أن يكون خطيراً' },
            { pattern: /localStorage\s*\./gi, severity: 'medium', description: 'استخدام localStorage يحتاج مراجعة' },
            { pattern: /sessionStorage\s*\./gi, severity: 'medium', description: 'استخدام sessionStorage يحتاج مراجعة' },
            { pattern: /fetch\s*\(/gi, severity: 'low', description: 'اتصال شبكي يحتاج مراجعة' },
            { pattern: /XMLHttpRequest/gi, severity: 'low', description: 'اتصال شبكي قد يحتاج مراجعة' }
        ];

        suspiciousPatterns.forEach(({ pattern, severity, description }) => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    suspiciousFindings.push({
                        type: 'Suspicious',
                        pattern: pattern.toString(),
                        match: match.substring(0, 100),
                        severity: severity,
                        description: description,
                        line: this.findLineNumber(content, match)
                    });
                });
            }
        });

        return {
            findings: suspiciousFindings,
            totalFindings: suspiciousFindings.length
        };
    }

    /**
     * حساب درجة المخاطر الإجمالية
     * Calculate overall risk score
     */
    calculateOverallRisk(details) {
        const weights = {
            xss: 0.3,
            injection: 0.25,
            csrf: 0.2,
            clickjacking: 0.15,
            suspicious: 0.1
        };

        let totalScore = 0;
        
        if (details.xss) totalScore += details.xss.riskScore * weights.xss;
        if (details.injection) totalScore += details.injection.riskScore * weights.injection;
        if (details.csrf) totalScore += details.csrf.riskScore * weights.csrf;
        if (details.clickjacking) totalScore += details.clickjacking.riskScore * weights.clickjacking;
        if (details.suspicious) totalScore += Math.min(details.suspicious.totalFindings * 10, 50) * weights.suspicious;

        return Math.round(Math.min(totalScore, 100));
    }

    /**
     * تحديد التهديدات الرئيسية
     * Identify top threats
     */
    identifyTopThreats(details) {
        const threats = [];

        Object.keys(details).forEach(category => {
            if (details[category] && details[category].findings) {
                details[category].findings.forEach(finding => {
                    threats.push({
                        ...finding,
                        category: category,
                        impact: this.calculateImpact(finding),
                        likelihood: this.calculateLikelihood(finding)
                    });
                });
            }
        });

        // ترتيب التهديدات حسب الخطورة
        return threats.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        }).slice(0, 10); // أفضل 10 تهديدات
    }

    /**
     * توليد التوصيات
     * Generate recommendations
     */
    generateRecommendations(details) {
        const recommendations = [];

        // توصيات XSS
        if (details.xss && details.xss.riskScore > 0) {
            recommendations.push({
                priority: 'عالية',
                category: 'XSS',
                title: 'حماية من هجمات Cross-Site Scripting',
                description: 'استخدم CSP مع strict-dynamic وrequire-trusted-types-for',
                implementation: this.generateCSPRecommendations(details.xss.findings),
                severity: details.xss.level
            });
        }

        // توصيات Injection
        if (details.injection && details.injection.riskScore > 0) {
            recommendations.push({
                priority: 'عالية',
                category: 'Injection',
                title: 'حماية من هجمات SQL Injection',
                description: 'استخدم parameterized queries وinput validation',
                implementation: this.generateInjectionRecommendations(details.injection.findings),
                severity: details.injection.level
            });
        }

        // توصيات CSRF
        if (details.csrf && details.csrf.riskScore > 0) {
            recommendations.push({
                priority: 'متوسطة',
                category: 'CSRF',
                title: 'حماية من هجمات Cross-Site Request Forgery',
                description: 'استخدم CSRF tokens وSameSite cookies',
                implementation: this.generateCSRFRecommendations(details.csrf.findings),
                severity: details.csrf.level
            });
        }

        // توصيات عامة
        if (details.suspicious && details.suspicious.totalFindings > 5) {
            recommendations.push({
                priority: 'متوسطة',
                category: 'General',
                title: 'مراجعة الكود العام',
                description: 'قم بمراجعة الكود للتأكد من اتباع أفضل الممارسات الأمنية',
                implementation: this.generateGeneralRecommendations(details.suspicious.findings),
                severity: 'medium'
            });
        }

        return recommendations;
    }

    /**
     * توليد توصيات CSP
     * Generate CSP recommendations
     */
    generateCSPRecommendations(xssFindings) {
        const hasInline = xssFindings.some(f => f.match.includes('<script'));
        const hasExternal = xssFindings.some(f => f.match.includes('src='));
        
        let csp = "default-src 'self';";
        
        if (hasExternal) {
            csp += " script-src 'self' 'unsafe-inline';";
        } else {
            csp += " script-src 'self' 'unsafe-eval' 'unsafe-inline';";
        }
        
        csp += " style-src 'self' 'unsafe-inline';";
        csp += " img-src 'self' data: https:;";
        csp += " font-src 'self';";
        csp += " connect-src 'self';";
        csp += " frame-ancestors 'none';";
        csp += " base-uri 'self';";
        csp += " form-action 'self';";

        return [
            `أضف رأس HTTP التالي: Content-Security-Policy: ${csp}`,
            'استخدم Trusted Types API للحماية من DOM XSS',
            'تجنب استخدام innerHTML وdocument.write',
            'استخدم textContent بدلاً من innerHTML',
            'قم بتشفير جميع المدخلات من المستخدمين'
        ];
    }

    /**
     * توليد توصيات Injection
     * Generate injection recommendations
     */
    generateInjectionRecommendations(injectionFindings) {
        return [
            'استخدم parameterized queries لجميع استعلامات قاعدة البيانات',
            'قم بتطبيق input validation صارم',
            'استخدم ORM آمن مثل Prisma أو TypeORM',
            'قم بتطبيق principle of least privilege',
            'استخدم prepared statements في جميع الاستعلامات'
        ];
    }

    /**
     * توليد توصيات CSRF
     * Generate CSRF recommendations
     */
    generateCSRFRecommendations(csrfFindings) {
        return [
            'أضف CSRF tokens لجميع النماذج',
            'استخدم SameSite cookies',
            'تطبيق referer validation',
            'استخدم double submit cookie pattern',
            'استخدم SameSite=Strict للcookies الحساسة'
        ];
    }

    /**
     * توليد توصيات عامة
     * Generate general recommendations
     */
    generateGeneralRecommendations(suspiciousFindings) {
        const commonIssues = suspiciousFindings.map(f => f.description);
        const uniqueIssues = [...new Set(commonIssues)];
        
        return uniqueIssues.map(issue => `مراجعة: ${issue}`).concat([
            'تطبيق code review process',
            'استخدام static code analysis tools',
            'تطبيق security testing في CI/CD',
            'تحديث جميع المكتبات بانتظام'
        ]);
    }

    /**
     * حساب التأثير
     * Calculate impact
     */
    calculateImpact(finding) {
        const impactScores = {
            critical: 9,
            high: 7,
            medium: 5,
            low: 3,
            info: 1
        };
        return impactScores[finding.severity] || 1;
    }

    /**
     * حساب الاحتمالية
     * Calculate likelihood
     */
    calculateLikelihood(finding) {
        // حساب مبسط للاحتمالية بناءً على نوع التهديد
        const likelihoodScores = {
            xss: 8,
            injection: 7,
            csrf: 6,
            clickjacking: 5,
            suspicious: 4
        };
        return likelihoodScores[finding.type.toLowerCase()] || 3;
    }

    /**
     * الحصول على درجة الخطورة حسب النمط
     * Get severity by pattern
     */
    getSeverityByPattern(category, patternIndex) {
        const severities = {
            xss: ['critical', 'high', 'high', 'medium', 'medium'],
            injection: ['critical', 'critical', 'high', 'high', 'medium', 'medium', 'medium', 'medium', 'medium'],
            csrf: ['high', 'medium', 'medium'],
            clickjacking: ['medium', 'low', 'low']
        };
        return severities[category]?.[patternIndex] || 'low';
    }

    /**
     * الحصول على درجة الخطورة
     * Get severity score
     */
    getSeverityScore(category, patternIndex) {
        const severity = this.getSeverityByPattern(category, patternIndex);
        const scores = {
            critical: 25,
            high: 15,
            medium: 10,
            low: 5,
            info: 2
        };
        return scores[severity] || 2;
    }

    /**
     * الحصول على مستوى المخاطر
     * Get risk level
     */
    getRiskLevel(score) {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        if (score >= 20) return 'low';
        return 'info';
    }

    /**
     * العثور على رقم السطر
     * Find line number
     */
    findLineNumber(content, match) {
        const lines = content.substring(0, content.indexOf(match)).split('\n');
        return lines.length;
    }

    /**
     * الحصول على سجل التحليل
     * Get analysis history
     */
    getAnalysisHistory(limit = 10) {
        return this.analysisHistory.slice(-limit).reverse();
    }

    /**
     * تصدير التقرير
     * Export report
     */
    exportReport(analysisResult, format = 'json') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `threat-analysis-${timestamp}.${format}`;

        if (format === 'json') {
            const dataStr = JSON.stringify(analysisResult, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            
            URL.revokeObjectURL(url);
        } else if (format === 'html') {
            const html = this.generateHTMLReport(analysisResult);
            const dataBlob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            
            URL.revokeObjectURL(url);
        }
    }

    /**
     * توليد تقرير HTML
     * Generate HTML report
     */
    generateHTMLReport(analysisResult) {
        return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير تحليل التهديدات - Threat Analysis Report</title>
    <style>
        body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; margin: 20px; background: #0A0A0A; color: #E0E0E0; }
        .header { background: linear-gradient(135deg, #00E0D5, #00B8B8); color: #0A0A0A; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .section { background: #1A1A1A; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #333; }
        .threat { background: #2A2A2A; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #FF4444; }
        .recommendation { background: #2A2A2A; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #00E0D5; }
        .risk-score { font-size: 2em; font-weight: bold; color: #FF4444; }
        .severity-critical { border-left-color: #FF4444; }
        .severity-high { border-left-color: #FF8800; }
        .severity-medium { border-left-color: #FFAA00; }
        .severity-low { border-left-color: #FFDD00; }
        .code { background: #0D1117; padding: 10px; border-radius: 5px; font-family: 'JetBrains Mono', monospace; direction: ltr; }
    </style>
</head>
<body>
    <div class="header">
        <h1>تقرير تحليل التهديدات الأمنية</h1>
        <p>Security Threat Analysis Report</p>
        <p>التاريخ: ${new Date(analysisResult.timestamp).toLocaleString('ar-SA')}</p>
        <p>المصدر: ${analysisResult.source}</p>
        <div class="risk-score">درجة المخاطر: ${analysisResult.riskScore}%</div>
    </div>

    <div class="section">
        <h2>التهديدات المكتشفة</h2>
        <p>Discovered Threats</p>
        ${analysisResult.threats.map(threat => `
            <div class="threat severity-${threat.severity}">
                <h3>${threat.type} - ${threat.severity}</h3>
                <p><strong>النمط:</strong> <span class="code">${threat.pattern}</span></p>
                <p><strong>التطابق:</strong> <span class="code">${threat.match}</span></p>
                <p><strong>السطر:</strong> ${threat.line}</p>
                <p><strong>التأثير:</strong> ${threat.impact}/10</p>
                <p><strong>الاحتمالية:</strong> ${threat.likelihood}/10</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>التوصيات الأمنية</h2>
        <p>Security Recommendations</p>
        ${analysisResult.recommendations.map(rec => `
            <div class="recommendation">
                <h3>${rec.title}</h3>
                <p><strong>الأولوية:</strong> ${rec.priority}</p>
                <p><strong>الفئة:</strong> ${rec.category}</p>
                <p><strong>الوصف:</strong> ${rec.description}</p>
                <p><strong>التنفيذ:</strong></p>
                <ul>
                    ${rec.implementation.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>تفاصيل التحليل</h2>
        <p>Analysis Details</p>
        <pre class="code">${JSON.stringify(analysisResult.details, null, 2)}</pre>
    </div>
</body>
</html>`;
    }

    /**
     * الحصول على إحصائيات التحليل
     * Get analysis statistics
     */
    getStatistics() {
        const totalAnalyses = this.analysisHistory.length;
        const avgRiskScore = totalAnalyses > 0 
            ? this.analysisHistory.reduce((sum, analysis) => sum + analysis.riskScore, 0) / totalAnalyses 
            : 0;
        
        const threatCategories = {};
        let criticalThreats = 0;
        
        this.analysisHistory.forEach(analysis => {
            analysis.threats.forEach(threat => {
                threatCategories[threat.type] = (threatCategories[threat.type] || 0) + 1;
                if (threat.severity === 'critical') criticalThreats++;
            });
        });

        return {
            totalAnalyses,
            avgRiskScore: Math.round(avgRiskScore),
            threatCategories,
            criticalThreats,
            lastAnalysis: totalAnalyses > 0 ? this.analysisHistory[this.analysisHistory.length - 1].timestamp : null
        };
    }
}

// تصدير الكلاس للاستخدام
window.AIThreatAnalyzer = AIThreatAnalyzer;