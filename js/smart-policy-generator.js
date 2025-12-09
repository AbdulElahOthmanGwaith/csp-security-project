/**
 * مولد السياسات التلقائي الذكي
 * Smart Auto-Policy Generator
 * Intelligent CSP and security policy generation system
 */

class SmartPolicyGenerator {
    constructor() {
        this.policyTemplates = {
            basic: {
                name: 'الأساسي',
                description: 'سياسة أمان أساسية للمواقع البسيطة',
                csp: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';",
                headers: {
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block'
                }
            },
            strict: {
                name: 'صارم',
                description: 'سياسة أمان صارمة للتطبيقات الحساسة',
                csp: "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
                headers: {
                    'Content-Security-Policy': '',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block',
                    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                    'Referrer-Policy': 'strict-origin-when-cross-origin'
                }
            },
            modern: {
                name: 'حديث',
                description: 'سياسة حديثة مع Trusted Types و strict-dynamic',
                csp: "default-src 'self'; script-src 'self' 'strict-dynamic' 'nonce-{random}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; require-trusted-types-for 'script';",
                headers: {
                    'Content-Security-Policy': '',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'Cross-Origin-Opener-Policy': 'same-origin',
                    'Cross-Origin-Embedder-Policy': 'require-corp',
                    'Cross-Origin-Resource-Policy': 'same-origin'
                }
            },
            ecommerce: {
                name: 'التجارة الإلكترونية',
                description: 'سياسة مخصصة للمتاجر الإلكترونية',
                csp: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https:;",
                headers: {
                    'Content-Security-Policy': '',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block',
                    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
                    'Referrer-Policy': 'strict-origin-when-cross-origin'
                }
            },
            saas: {
                name: 'تطبيق SaaS',
                description: 'سياسة لتطبيقات البرمجيات كخدمة',
                csp: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; worker-src 'self';",
                headers: {
                    'Content-Security-Policy': '',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'Cross-Origin-Opener-Policy': 'same-origin',
                    'Cross-Origin-Embedder-Policy': 'require-corp',
                    'Referrer-Policy': 'strict-origin-when-cross-origin'
                }
            }
        };

        this.analyzer = new AIThreatAnalyzer();
        this.userPreferences = this.loadUserPreferences();
        this.learningData = this.loadLearningData();
    }

    /**
     * تحليل الموقع وتوليد السياسة المناسبة
     * Analyze website and generate appropriate policy
     */
    async generatePolicy(websiteUrl, options = {}) {
        try {
            // تحليل الموقع
            const analysis = await this.analyzeWebsite(websiteUrl);
            
            // تحديد نوع الموقع
            const websiteType = this.classifyWebsiteType(analysis);
            
            // توليد السياسة الأساسية
            let basePolicy = this.getBasePolicy(websiteType, options.strictness);
            
            // تخصيص السياسة بناءً على التحليل
            const customizedPolicy = this.customizePolicy(basePolicy, analysis, options);
            
            // تحسين السياسة
            const optimizedPolicy = this.optimizePolicy(customizedPolicy, analysis);
            
            // إضافة التوصيات
            const finalPolicy = this.addRecommendations(optimizedPolicy, analysis);
            
            return {
                websiteUrl,
                websiteType,
                analysis,
                policy: finalPolicy,
                recommendations: this.generateImplementationRecommendations(finalPolicy),
                implementation: this.generateImplementationGuide(finalPolicy),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('خطأ في توليد السياسة:', error);
            throw new Error(`فشل في توليد السياسة: ${error.message}`);
        }
    }

    /**
     * تحليل الموقع
     * Analyze website
     */
    async analyzeWebsite(url) {
        const analysis = {
            url,
            technologies: [],
            externalResources: [],
            securityHeaders: {},
            scripts: [],
            styles: [],
            images: [],
            forms: [],
            iframes: [],
            metaTags: [],
            javascriptFeatures: []
        };

        try {
            // محاكاة تحليل الموقع (في التطبيق الحقيقي، ستحتاج API أو web scraping)
            analysis.technologies = await this.detectTechnologies(url);
            analysis.externalResources = await this.scanExternalResources(url);
            analysis.securityHeaders = await this.checkSecurityHeaders(url);
            analysis.scripts = await this.scanScripts(url);
            analysis.styles = await this.scanStyles(url);
            analysis.images = await this.scanImages(url);
            analysis.forms = await this.scanForms(url);
            analysis.iframes = await this.scanIframes(url);
            analysis.metaTags = await this.scanMetaTags(url);
            analysis.javascriptFeatures = await this.detectJavaScriptFeatures(url);

        } catch (error) {
            console.warn('تحليل جزئي للموقع:', error);
            // في حالة الفشل، نستخدم تحليل افتراضي
            analysis.technologies = ['HTML5', 'CSS3', 'JavaScript'];
            analysis.externalResources = [];
            analysis.securityHeaders = {};
        }

        return analysis;
    }

    /**
     * اكتشاف التقنيات المستخدمة
     * Detect used technologies
     */
    async detectTechnologies(url) {
        const technologies = [];
        
        try {
            // فحص React
            if (window.React || document.querySelector('[data-reactroot]')) {
                technologies.push('React');
            }
            
            // فحص Vue.js
            if (window.Vue || document.querySelector('[v-cloak]')) {
                technologies.push('Vue.js');
            }
            
            // فحص Angular
            if (window.angular || document.querySelector('[ng-app]')) {
                technologies.push('Angular');
            }
            
            // فحص jQuery
            if (window.jQuery || window.$) {
                technologies.push('jQuery');
            }
            
            // فحص Bootstrap
            if (window.bootstrap || document.querySelector('.btn-primary')) {
                technologies.push('Bootstrap');
            }
            
            // فحص TypeScript
            if (document.querySelector('script[type="module"]') || window.TypeScript) {
                technologies.push('TypeScript');
            }
            
        } catch (error) {
            console.warn('خطأ في اكتشاف التقنيات:', error);
        }
        
        return technologies.length > 0 ? technologies : ['HTML5', 'CSS3', 'JavaScript'];
    }

    /**
     * فحص الموارد الخارجية
     * Scan external resources
     */
    async scanExternalResources(url) {
        const resources = {
            scripts: [],
            styles: [],
            images: [],
            fonts: []
        };

        try {
            // فحص العناصر في DOM
            document.querySelectorAll('script[src]').forEach(script => {
                const src = script.src;
                if (src.startsWith('http') && !src.includes(new URL(url).hostname)) {
                    resources.scripts.push({
                        src,
                        integrity: script.integrity || null,
                        crossorigin: script.crossOrigin || null
                    });
                }
            });

            document.querySelectorAll('link[href]').forEach(link => {
                const href = link.href;
                if (href.startsWith('http') && !href.includes(new URL(url).hostname)) {
                    if (link.rel === 'stylesheet') {
                        resources.styles.push({
                            href,
                            integrity: link.integrity || null,
                            crossorigin: link.crossOrigin || null
                        });
                    } else if (link.rel.includes('icon') || link.rel.includes('apple-touch-icon')) {
                        resources.images.push({ href });
                    } else if (link.rel === 'preload' && link.as === 'font') {
                        resources.fonts.push({ href });
                    }
                }
            });

            document.querySelectorAll('img[src]').forEach(img => {
                const src = img.src;
                if (src.startsWith('http') && !src.includes(new URL(url).hostname)) {
                    resources.images.push({
                        src,
                        alt: img.alt || null
                    });
                }
            });

        } catch (error) {
            console.warn('خطأ في فحص الموارد الخارجية:', error);
        }

        return resources;
    }

    /**
     * فحص رؤوس الأمان
     * Check security headers
     */
    async checkSecurityHeaders(url) {
        const headers = {};
        
        try {
            // محاكاة فحص الرؤوس (في التطبيق الحقيقي تحتاج CORS proxy)
            const response = await fetch(url, { method: 'HEAD' });
            
            const securityHeaderNames = [
                'Content-Security-Policy',
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection',
                'Strict-Transport-Security',
                'Referrer-Policy',
                'Permissions-Policy',
                'Cross-Origin-Opener-Policy',
                'Cross-Origin-Embedder-Policy'
            ];

            securityHeaderNames.forEach(headerName => {
                const headerValue = response.headers.get(headerName);
                if (headerValue) {
                    headers[headerName] = headerValue;
                }
            });

        } catch (error) {
            console.warn('خطأ في فحص رؤوس الأمان:', error);
            // إرجاع قيم افتراضية بناءً على الموقع
            headers['X-Content-Type-Options'] = 'nosniff';
        }

        return headers;
    }

    /**
     * فحص السكريبت
     * Scan scripts
     */
    async scanScripts(url) {
        const scripts = [];
        
        try {
            document.querySelectorAll('script').forEach(script => {
                scripts.push({
                    src: script.src || null,
                    type: script.type || 'text/javascript',
                    async: script.async || false,
                    defer: script.defer || false,
                    nonce: script.nonce || null,
                    integrity: script.integrity || null,
                    hasInline: script.textContent.trim().length > 0,
                    lineCount: script.textContent.split('\n').length
                });
            });
        } catch (error) {
            console.warn('خطأ في فحص السكريبت:', error);
        }

        return scripts;
    }

    /**
     * فحص الأنماط
     * Scan styles
     */
    async scanStyles(url) {
        const styles = [];
        
        try {
            document.querySelectorAll('style').forEach(style => {
                styles.push({
                    hasInline: style.textContent.trim().length > 0,
                    lineCount: style.textContent.split('\n').length
                });
            });

            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                styles.push({
                    href: link.href,
                    integrity: link.integrity || null,
                    crossorigin: link.crossOrigin || null
                });
            });
        } catch (error) {
            console.warn('خطأ في فحص الأنماط:', error);
        }

        return styles;
    }

    /**
     * فحص الصور
     * Scan images
     */
    async scanImages(url) {
        const images = [];
        
        try {
            document.querySelectorAll('img').forEach(img => {
                images.push({
                    src: img.src,
                    alt: img.alt || null,
                    width: img.width || null,
                    height: img.height || null,
                    loading: img.loading || 'eager'
                });
            });
        } catch (error) {
            console.warn('خطأ في فحص الصور:', error);
        }

        return images;
    }

    /**
     * فحص النماذج
     * Scan forms
     */
    async scanForms(url) {
        const forms = [];
        
        try {
            document.querySelectorAll('form').forEach(form => {
                forms.push({
                    action: form.action || null,
                    method: form.method || 'GET',
                    target: form.target || null,
                    hasCSRF: form.querySelector('input[name*="token"], input[name*="csrf"]') !== null,
                    inputs: Array.from(form.querySelectorAll('input')).map(input => ({
                        type: input.type,
                        name: input.name,
                        required: input.required
                    }))
                });
            });
        } catch (error) {
            console.warn('خطأ في فحص النماذج:', error);
        }

        return forms;
    }

    /**
     * فحص الإطارات
     * Scan iframes
     */
    async scanIframes(url) {
        const iframes = [];
        
        try {
            document.querySelectorAll('iframe').forEach(iframe => {
                iframes.push({
                    src: iframe.src || null,
                    sandbox: iframe.sandbox || null,
                    width: iframe.width || null,
                    height: iframe.height || null
                });
            });
        } catch (error) {
            console.warn('خطأ في فحص الإطارات:', error);
        }

        return iframes;
    }

    /**
     * فحص Meta Tags
     * Scan meta tags
     */
    async scanMetaTags(url) {
        const metaTags = [];
        
        try {
            document.querySelectorAll('meta').forEach(meta => {
                metaTags.push({
                    name: meta.name || meta.property || null,
                    content: meta.content || null,
                    httpEquiv: meta.httpEquiv || null
                });
            });
        } catch (error) {
            console.warn('خطأ في فحص Meta Tags:', error);
        }

        return metaTags;
    }

    /**
     * اكتشاف ميزات JavaScript
     * Detect JavaScript features
     */
    async detectJavaScriptFeatures(url) {
        const features = [];
        
        try {
            // فحص ميزات المتصفح
            if ('fetch' in window) features.push('Fetch API');
            if ('Promise' in window) features.push('Promises');
            if ('localStorage' in window) features.push('LocalStorage');
            if ('sessionStorage' in window) features.push('SessionStorage');
            if ('WebSocket' in window) features.push('WebSocket');
            if ('ServiceWorker' in window) features.push('ServiceWorker');
            if ('WebRTC' in window) features.push('WebRTC');
            if ('Notification' in window) features.push('Notifications');
            if ('Notification' in window && 'permission' in Notification) {
                const permission = Notification.permission;
                if (permission === 'granted') features.push('Notifications (granted)');
                else if (permission === 'denied') features.push('Notifications (denied)');
            }

            // فحص مكتبات معينة
            if (window.jQuery) features.push('jQuery');
            if (window.React) features.push('React');
            if (window.Vue) features.push('Vue.js');
            if (window.angular) features.push('Angular');
            if (window.bootstrap) features.push('Bootstrap');

        } catch (error) {
            console.warn('خطأ في اكتشاف ميزات JavaScript:', error);
        }

        return features;
    }

    /**
     * تصنيف نوع الموقع
     * Classify website type
     */
    classifyWebsiteType(analysis) {
        const { technologies, scripts, forms, iframes, javascriptFeatures } = analysis;
        
        // فحص مؤشرات التجارة الإلكترونية
        if (forms.some(form => form.action && form.action.includes('checkout')) ||
            scripts.some(script => script.src && script.src.includes('stripe')) ||
            scripts.some(script => script.src && script.src.includes('paypal'))) {
            return 'ecommerce';
        }
        
        // فحص مؤشرات SaaS
        if (javascriptFeatures.includes('WebSocket') ||
            javascriptFeatures.includes('ServiceWorker') ||
            scripts.some(script => script.src && script.src.includes('api'))) {
            return 'saas';
        }
        
        // فحص مؤشرات التطبيق التفاعلي
        if (javascriptFeatures.includes('WebRTC') ||
            technologies.includes('React') ||
            technologies.includes('Vue.js') ||
            technologies.includes('Angular')) {
            return 'modern';
        }
        
        // فحص مؤشرات الموقع الأساسي
        if (scripts.length === 0 && forms.length === 0 && iframes.length === 0) {
            return 'basic';
        }
        
        // افتراضي
        return 'modern';
    }

    /**
     * الحصول على السياسة الأساسية
     * Get base policy
     */
    getBasePolicy(websiteType, strictness = 'medium') {
        let template = this.policyTemplates[websiteType] || this.policyTemplates.basic;
        
        if (strictness === 'high') {
            template = this.policyTemplates.strict;
        } else if (strictness === 'low') {
            // تخفيف السياسة للصرامة المنخفضة
            template = {
                ...template,
                csp: template.csp.replace("'none'", "'self'").replace("'strict-dynamic'", "'unsafe-inline'")
            };
        }
        
        return { ...template };
    }

    /**
     * تخصيص السياسة
     * Customize policy
     */
    customizePolicy(basePolicy, analysis, options) {
        let csp = basePolicy.csp;
        const headers = { ...basePolicy.headers };
        
        // إضافة مصادر خارجية للسكريبت
        if (analysis.externalResources.scripts.length > 0) {
            const scriptDomains = analysis.externalResources.scripts
                .map(resource => this.extractDomain(resource.src))
                .filter(domain => domain);
            
            if (scriptDomains.length > 0) {
                csp = csp.replace("script-src 'self'", 
                    `script-src 'self' ${scriptDomains.map(domain => `${domain}`).join(' ')}`);
            }
        }
        
        // إضافة مصادر خارجية للأنماط
        if (analysis.externalResources.styles.length > 0) {
            const styleDomains = analysis.externalResources.styles
                .map(resource => this.extractDomain(resource.href))
                .filter(domain => domain);
            
            if (styleDomains.length > 0) {
                csp = csp.replace("style-src 'self'", 
                    `style-src 'self' ${styleDomains.map(domain => `${domain}`).join(' ')}`);
            }
        }
        
        // إضافة مصادر للخطوط
        if (analysis.externalResources.fonts.length > 0) {
            const fontDomains = analysis.externalResources.fonts
                .map(resource => this.extractDomain(resource.href))
                .filter(domain => domain);
            
            if (fontDomains.length > 0) {
                csp = csp.replace("font-src 'self'", 
                    `font-src 'self' ${fontDomains.map(domain => `${domain}`).join(' ')}`);
            }
        }
        
        // إضافة connect-src للموارد الخارجية
        if (analysis.externalResources.scripts.some(r => r.src.includes('api')) ||
            analysis.externalResources.scripts.some(r => r.src.includes('cdn'))) {
            const apiDomains = [
                ...analysis.externalResources.scripts
                    .filter(r => r.src.includes('api') || r.src.includes('cdn'))
                    .map(r => this.extractDomain(r.src))
            ].filter(domain => domain);
            
            if (apiDomains.length > 0) {
                csp += ` connect-src 'self' ${apiDomains.map(domain => `${domain}`).join(' ')}`;
            }
        }
        
        // معالجة النماذج
        if (analysis.forms.length > 0) {
            const formActions = analysis.forms
                .map(form => this.extractDomain(form.action))
                .filter(domain => domain);
            
            if (formActions.length > 0) {
                csp = csp.replace("form-action 'self'", 
                    `form-action 'self' ${formActions.map(domain => `${domain}`).join(' ')}`);
            }
        }
        
        // معالجة الإطارات
        if (analysis.iframes.length > 0) {
            const iframeSrcs = analysis.iframes
                .map(iframe => this.extractDomain(iframe.src))
                .filter(domain => domain);
            
            if (iframeSrcs.length > 0) {
                csp = csp.replace("frame-ancestors 'none'", 
                    `frame-ancestors 'self' ${iframeSrcs.map(domain => `${domain}`).join(' ')}`);
            } else {
                csp = csp.replace("frame-ancestors 'none'", "frame-ancestors 'self'");
            }
        }
        
        // تحديث header CSP
        headers['Content-Security-Policy'] = csp;
        
        // إضافة nonce للسكريبت المضمنة إذا كانت مطلوبة
        if (analysis.scripts.some(script => script.hasInline) && 
            options.includeNonce !== false) {
            const nonce = this.generateNonce();
            csp = csp.replace("'unsafe-inline'", `'nonce-${nonce}'`);
            headers['Content-Security-Policy'] = csp;
            headers['Content-Security-Policy-Script-Nonce'] = nonce;
        }
        
        return {
            name: basePolicy.name,
            description: basePolicy.description,
            csp: csp,
            headers: headers,
            analysis: analysis
        };
    }

    /**
     * تحسين السياسة
     * Optimize policy
     */
    optimizePolicy(policy, analysis) {
        const optimized = { ...policy };
        
        // إزالة القواعد المكررة
        optimized.csp = this.removeDuplicateDirectives(optimized.csp);
        
        // تحسين الأذونات
        if (analysis.javascriptFeatures.includes('ServiceWorker')) {
            optimized.csp += " worker-src 'self'";
        }
        
        if (analysis.javascriptFeatures.includes('WebRTC')) {
            optimized.csp += " media-src 'self'";
        }
        
        // إضافة SRI للموارد الخارجية
        optimized = this.addSRI(optimized, analysis);
        
        return optimized;
    }

    /**
     * إضافة التوصيات
     * Add recommendations
     */
    addRecommendations(policy, analysis) {
        const recommendations = [];
        
        // توصيات بناءً على التحليل
        if (analysis.securityHeaders['Content-Security-Policy']) {
            recommendations.push({
                type: 'improvement',
                title: 'تحديث CSP الحالي',
                description: 'تم اكتشاف CSP موجود، سيتم تحديثه',
                priority: 'medium'
            });
        }
        
        if (analysis.scripts.some(script => script.hasInline && !script.nonce)) {
            recommendations.push({
                type: 'security',
                title: 'إضافة Nonce للسكريبت المضمنة',
                description: 'يجب إضافة nonce أو hash للسكريبت المضمنة لأمان أفضل',
                priority: 'high'
            });
        }
        
        if (analysis.forms.length > 0 && !analysis.forms.some(form => form.hasCSRF)) {
            recommendations.push({
                type: 'security',
                title: 'إضافة حماية CSRF',
                description: 'النماذج تحتاج حماية من هجمات CSRF',
                priority: 'high'
            });
        }
        
        if (analysis.externalResources.scripts.some(r => !r.integrity)) {
            recommendations.push({
                type: 'security',
                title: 'إضافة Subresource Integrity',
                description: 'يجب إضافة integrity للموارد الخارجية',
                priority: 'medium'
            });
        }
        
        return {
            ...policy,
            recommendations: recommendations
        };
    }

    /**
     * توليد توصيات التنفيذ
     * Generate implementation recommendations
     */
    generateImplementationRecommendations(policy) {
        const recommendations = [];
        
        // توصيات HTTP Headers
        recommendations.push({
            category: 'HTTP Headers',
            items: Object.entries(policy.headers).map(([header, value]) => ({
                header,
                value,
                description: this.getHeaderDescription(header)
            }))
        });
        
        // توصيات CSP
        recommendations.push({
            category: 'Content Security Policy',
            items: [{
                directive: 'Content-Security-Policy',
                value: policy.csp,
                description: 'سياسة أمان المحتوى الرئيسية'
            }]
        });
        
        // توصيات إضافية
        recommendations.push({
            category: 'Additional Security',
            items: [
                {
                    header: 'X-Content-Type-Options',
                    value: 'nosniff',
                    description: 'منع MIME type sniffing'
                },
                {
                    header: 'X-Frame-Options',
                    value: 'DENY',
                    description: 'منع تضمين الموقع في إطارات'
                },
                {
                    header: 'X-XSS-Protection',
                    value: '1; mode=block',
                    description: 'تفعيل حماية XSS في المتصفح'
                }
            ]
        });
        
        return recommendations;
    }

    /**
     * توليد دليل التنفيذ
     * Generate implementation guide
     */
    generateImplementationGuide(policy) {
        return {
            overview: 'دليل تنفيذ سياسة الأمان',
            steps: [
                {
                    step: 1,
                    title: 'إضافة HTTP Headers',
                    description: 'أضف الرؤوس الأمنية التالية إلى خادمك',
                    code: this.generateServerConfig(policy.headers),
                    platforms: {
                        apache: this.generateApacheConfig(policy.headers),
                        nginx: this.generateNginxConfig(policy.headers),
                        nodejs: this.generateNodeJSConfig(policy.headers),
                        php: this.generatePHPConfig(policy.headers)
                    }
                },
                {
                    step: 2,
                    title: 'تحديث Meta Tags',
                    description: 'أضف Meta tags للأمان إذا لم تكن متوفرة',
                    code: this.generateMetaTags()
                },
                {
                    step: 3,
                    title: 'اختبار السياسة',
                    description: 'اختبر السياسة باستخدام أدوات الاختبار المضمنة',
                    action: 'Open CSP Tester'
                },
                {
                    step: 4,
                    title: 'المراقبة والتحديث',
                    description: 'راقب التنبيهات وحديث السياسة حسب الحاجة'
                }
            ]
        };
    }

    /**
     * توليد تكوين الخادم
     * Generate server configuration
     */
    generateServerConfig(headers) {
        return Object.entries(headers)
            .map(([header, value]) => `Header always set ${header} "${value}"`)
            .join('\n');
    }

    /**
     * توليد تكوين Apache
     * Generate Apache configuration
     */
    generateApacheConfig(headers) {
        return `<IfModule mod_headers.c>
${Object.entries(headers)
    .map(([header, value]) => `    Header always set ${header} "${value}"`)
    .join('\n')}
</IfModule>`;
    }

    /**
     * توليد تكوين Nginx
     * Generate Nginx configuration
     */
    generateNginxConfig(headers) {
        return `location / {
${Object.entries(headers)
    .map(([header, value]) => `    add_header ${header} "${value}" always;`)
    .join('\n')}
}`;
    }

    /**
     * توليد تكوين Node.js
     * Generate Node.js configuration
     */
    generateNodeJSConfig(headers) {
        return `const express = require('express');
const app = express();

// إضافة الرؤوس الأمنية
${Object.entries(headers)
    .map(([header, value]) => `app.use((req, res, next) => {
    res.setHeader('${header}', '${value}');
    next();
});`)
    .join('\n\n')}

app.listen(3000);`;
    }

    /**
     * توليد تكوين PHP
     * Generate PHP configuration
     */
    generatePHPConfig(headers) {
        return `<?php
// إضافة الرؤوس الأمنية
${Object.entries(headers)
    .map(([header, value]) => `header('${header}: ${value}');`)
    .join('\n')}

// أو في .htaccess
/*

${this.generateApacheConfig(headers)}

*/`;
    }

    /**
     * توليد Meta Tags
     * Generate Meta tags
     */
    generateMetaTags() {
        return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="وصف الموقع">
<meta name="robots" content="index, follow">`;
    }

    /**
     * استخراج النطاق
     * Extract domain
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return null;
        }
    }

    /**
     * إزالة التوجيهات المكررة
     * Remove duplicate directives
     */
    removeDuplicateDirectives(csp) {
        const directives = {};
        const parts = csp.split(';').map(part => part.trim()).filter(part => part);
        
        parts.forEach(part => {
            const [directive, ...values] = part.split(' ');
            if (directive && !directives[directive]) {
                directives[directive] = values.join(' ');
            }
        });
        
        return Object.entries(directives)
            .map(([directive, values]) => `${directive} ${values}`)
            .join('; ');
    }

    /**
     * إضافة SRI
     * Add SRI
     */
    addSRI(policy, analysis) {
        // في التطبيق الحقيقي، ستحسب hashes للموارد
        // هنا نضيف فقط توصية
        if (analysis.externalResources.scripts.some(r => !r.integrity)) {
            policy.recommendations.push({
                type: 'security',
                title: 'إضافة Subresource Integrity',
                description: 'أضف integrity="sha256-..." للسكريبت الخارجية',
                priority: 'medium'
            });
        }
        
        return policy;
    }

    /**
     * توليد Nonce
     * Generate nonce
     */
    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }

    /**
     * الحصول على وصف Header
     * Get header description
     */
    getHeaderDescription(header) {
        const descriptions = {
            'Content-Security-Policy': 'سياسة أمان المحتوى',
            'X-Content-Type-Options': 'منع MIME type sniffing',
            'X-Frame-Options': 'منع clickjacking',
            'X-XSS-Protection': 'حماية XSS',
            'Strict-Transport-Security': 'فرض HTTPS',
            'Referrer-Policy': 'سياسة المرجع',
            'Permissions-Policy': 'سياسة الأذونات',
            'Cross-Origin-Opener-Policy': 'عزل المصادر المتقاطعة',
            'Cross-Origin-Embedder-Policy': 'سياسة تضمين المصادر المتقاطعة'
        };
        return descriptions[header] || 'رأس أمني';
    }

    /**
     * حفظ تفضيلات المستخدم
     * Save user preferences
     */
    saveUserPreferences(preferences) {
        this.userPreferences = { ...this.userPreferences, ...preferences };
        localStorage.setItem('smartPolicyUserPreferences', JSON.stringify(this.userPreferences));
    }

    /**
     * تحميل تفضيلات المستخدم
     * Load user preferences
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('smartPolicyUserPreferences');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    /**
     * حفظ بيانات التعلم
     * Save learning data
     */
    saveLearningData(data) {
        this.learningData = { ...this.learningData, ...data };
        localStorage.setItem('smartPolicyLearningData', JSON.stringify(this.learningData));
    }

    /**
     * تحميل بيانات التعلم
     * Load learning data
     */
    loadLearningData() {
        try {
            const saved = localStorage.getItem('smartPolicyLearningData');
            return saved ? JSON.parse(saved) : { generated: [], feedback: [] };
        } catch {
            return { generated: [], feedback: [] };
        }
    }
}

// تصدير الكلاس للاستخدام
window.SmartPolicyGenerator = SmartPolicyGenerator;