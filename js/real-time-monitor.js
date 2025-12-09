/**
 * نظام المراقبة الأمنية في الوقت الفعلي
 * Real-time Security Monitoring System
 * Comprehensive security monitoring and alerting platform
 */

class SecurityMonitor {
    constructor() {
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.alerts = [];
        this.metrics = {
            requests: 0,
            blockedRequests: 0,
            threats: 0,
            responseTime: 0,
            errors: 0
        };
        this.thresholds = {
            responseTime: 5000, // 5 seconds
            errorRate: 5, // 5%
            threatRate: 10, // 10 threats per minute
            blockedRate: 50 // 50% blocked requests
        };
        this.alertRules = [];
        this.eventHandlers = new Map();
        
        this.init();
    }

    /**
     * تهيئة النظام
     * Initialize the system
     */
    init() {
        this.setupEventListeners();
        this.loadSavedConfig();
        this.initializeMetrics();
    }

    /**
     * إعداد مستمعي الأحداث
     * Setup event listeners
     */
    setupEventListeners() {
        // مراقبة طلبات الشبكة
        if (window.fetch) {
            const originalFetch = window.fetch;
            window.fetch = (...args) => {
                this.trackRequest('fetch', args);
                return originalFetch.apply(window, args)
                    .then(response => {
                        this.trackResponse('fetch', response);
                        return response;
                    })
                    .catch(error => {
                        this.trackError('fetch', error);
                        throw error;
                    });
            };
        }

        // مراقبة XMLHttpRequest
        if (window.XMLHttpRequest) {
            const OriginalXHR = window.XMLHttpRequest;
            window.XMLHttpRequest = function() {
                const xhr = new OriginalXHR();
                const originalOpen = xhr.open;
                const originalSend = xhr.send;

                xhr.open = function(method, url, ...args) {
                    this._method = method;
                    this._url = url;
                    return originalOpen.apply(xhr, [method, url, ...args]);
                };

                xhr.send = function(...args) {
                    securityMonitor.trackRequest('xhr', { method: this._method, url: this._url });
                    
                    xhr.addEventListener('load', () => {
                        securityMonitor.trackResponse('xhr', { status: xhr.status, url: this._url });
                    });

                    xhr.addEventListener('error', (error) => {
                        securityMonitor.trackError('xhr', error);
                    });

                    return originalSend.apply(xhr, args);
                };

                return xhr;
            };
        }

        // مراقبة أخطاء JavaScript
        window.addEventListener('error', (event) => {
            this.trackError('javascript', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // مراقبة أخطاء Promise
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError('promise', {
                reason: event.reason,
                promise: event.promise
            });
        });

        // مراقبة تغييرات DOM
        if (window.MutationObserver) {
            this.setupDOMMonitoring();
        }
    }

    /**
     * إعداد مراقبة DOM
     * Setup DOM monitoring
     */
    setupDOMMonitoring() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // مراقبة إضافة عناصر جديدة
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.analyzeNewElement(node);
                    }
                });

                // مراقبة تغييرات الخصائص
                if (mutation.type === 'attributes') {
                    this.analyzeAttributeChange(mutation);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true
        });

        this.domObserver = observer;
    }

    /**
     * تحليل عنصر جديد
     * Analyze new element
     */
    analyzeNewElement(element) {
        const securityChecks = [
            {
                name: 'scriptInjection',
                check: () => element.tagName === 'SCRIPT' && element.src,
                severity: 'high',
                message: 'تم إضافة عنصر script جديد'
            },
            {
                name: 'iframeInjection',
                check: () => element.tagName === 'IFRAME',
                severity: 'medium',
                message: 'تم إضافة iframe جديد'
            },
            {
                name: 'formInjection',
                check: () => element.tagName === 'FORM',
                severity: 'low',
                message: 'تم إضافة form جديد'
            },
            {
                name: 'externalResource',
                check: () => {
                    const src = element.getAttribute('src') || element.getAttribute('href');
                    return src && (src.startsWith('http://') || src.startsWith('//'));
                },
                severity: 'low',
                message: 'تم إضافة مورد خارجي'
            }
        ];

        securityChecks.forEach(check => {
            if (check.check()) {
                this.triggerAlert({
                    type: 'domChange',
                    name: check.name,
                    severity: check.severity,
                    message: check.message,
                    element: {
                        tagName: element.tagName,
                        id: element.id,
                        className: element.className,
                        src: element.getAttribute('src'),
                        href: element.getAttribute('href')
                    },
                    timestamp: Date.now()
                });
            }
        });
    }

    /**
     * تحليل تغيير الخصائص
     * Analyze attribute change
     */
    analyzeAttributeChange(mutation) {
        const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'innerHTML', 'outerHTML'];
        const changedAttr = mutation.attributeName;

        if (dangerousAttributes.includes(changedAttr)) {
            this.triggerAlert({
                type: 'attributeChange',
                name: 'dangerousAttributeChange',
                severity: 'high',
                message: `تم تغيير خاصية خطيرة: ${changedAttr}`,
                element: {
                    tagName: mutation.target.tagName,
                    id: mutation.target.id,
                    attribute: changedAttr,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.getAttribute(changedAttr)
                },
                timestamp: Date.now()
            });
        }
    }

    /**
     * بدء المراقبة
     * Start monitoring
     */
    startMonitoring(interval = 1000) {
        if (this.isMonitoring) {
            console.warn('المراقبة نشطة بالفعل');
            return;
        }

        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
            this.checkThresholds();
            this.cleanupOldAlerts();
        }, interval);

        this.triggerEvent('monitoringStarted', { timestamp: Date.now() });
        console.log('تم بدء المراقبة الأمنية في الوقت الفعلي');
    }

    /**
     * إيقاف المراقبة
     * Stop monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            console.warn('المراقبة متوقفة بالفعل');
            return;
        }

        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.triggerEvent('monitoringStopped', { timestamp: Date.now() });
        console.log('تم إيقاف المراقبة الأمنية');
    }

    /**
     * تتبع الطلب
     * Track request
     */
    trackRequest(type, data) {
        const request = {
            type: type,
            timestamp: Date.now(),
            data: data,
            id: this.generateId()
        };

        this.metrics.requests++;
        this.triggerEvent('requestTracked', request);
    }

    /**
     * تتبع الاستجابة
     * Track response
     */
    trackResponse(type, data) {
        const response = {
            type: type,
            timestamp: Date.now(),
            data: data,
            id: this.generateId(),
            responseTime: Date.now() - this.getRequestTime(type)
        };

        // فحص إذا كان الطلب محظور
        if (data.status >= 400) {
            this.metrics.blockedRequests++;
            this.triggerAlert({
                type: 'blockedRequest',
                severity: 'medium',
                message: `طلب محظور: ${data.status}`,
                data: response,
                timestamp: Date.now()
            });
        }

        // تحديث متوسط وقت الاستجابة
        this.metrics.responseTime = (this.metrics.responseTime + response.responseTime) / 2;

        this.triggerEvent('responseTracked', response);
    }

    /**
     * تتبع الخطأ
     * Track error
     */
    trackError(type, error) {
        const errorEvent = {
            type: type,
            timestamp: Date.now(),
            error: error,
            id: this.generateId()
        };

        this.metrics.errors++;
        this.metrics.threats++;

        this.triggerAlert({
            type: 'error',
            severity: 'high',
            message: `خطأ ${type}: ${error.message || error}`,
            data: errorEvent,
            timestamp: Date.now()
        });

        this.triggerEvent('errorTracked', errorEvent);
    }

    /**
     * جمع المقاييس
     * Collect metrics
     */
    collectMetrics() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // حساب المعدلات
        const recentAlerts = this.alerts.filter(alert => alert.timestamp > oneMinuteAgo);
        const recentRequests = this.metrics.requests; // مبسط
        
        const metrics = {
            ...this.metrics,
            alertRate: recentAlerts.length,
            timestamp: now
        };

        this.triggerEvent('metricsCollected', metrics);
        return metrics;
    }

    /**
     * فحص الحدود
     * Check thresholds
     */
    checkThresholds() {
        const currentMetrics = this.collectMetrics();

        // فحص وقت الاستجابة
        if (currentMetrics.responseTime > this.thresholds.responseTime) {
            this.triggerAlert({
                type: 'performance',
                severity: 'medium',
                message: `وقت استجابة بطيء: ${currentMetrics.responseTime}ms`,
                timestamp: Date.now()
            });
        }

        // فحص معدل الأخطاء
        const errorRate = (currentMetrics.errors / currentMetrics.requests) * 100;
        if (errorRate > this.thresholds.errorRate) {
            this.triggerAlert({
                type: 'performance',
                severity: 'high',
                message: `معدل أخطاء عالي: ${errorRate.toFixed(2)}%`,
                timestamp: Date.now()
            });
        }

        // فحص معدل التهديدات
        const threatRate = this.getThreatRate();
        if (threatRate > this.thresholds.threatRate) {
            this.triggerAlert({
                type: 'security',
                severity: 'critical',
                message: `معدل تهديدات عالي: ${threatRate} تهديد/دقيقة`,
                timestamp: Date.now()
            });
        }
    }

    /**
     * حساب معدل التهديدات
     * Calculate threat rate
     */
    getThreatRate() {
        const oneMinuteAgo = Date.now() - 60000;
        const recentThreats = this.alerts.filter(alert => 
            alert.timestamp > oneMinuteAgo && alert.severity === 'critical'
        );
        return recentThreats.length;
    }

    /**
     * تشغيل التنبيه
     * Trigger alert
     */
    triggerAlert(alert) {
        const fullAlert = {
            id: this.generateId(),
            ...alert,
            timestamp: alert.timestamp || Date.now()
        };

        this.alerts.push(fullAlert);

        // الاحتفاظ بآخر 1000 تنبيه فقط
        if (this.alerts.length > 1000) {
            this.alerts = this.alerts.slice(-1000);
        }

        this.triggerEvent('alertTriggered', fullAlert);
        
        // إشعار المستخدم إذا كان متاحاً
        if (Notification.permission === 'granted') {
            new Notification(`تنبيه أمني: ${alert.severity}`, {
                body: alert.message,
                icon: '/favicon.ico'
            });
        }

        console.log('تنبيه أمني:', fullAlert);
    }

    /**
     * تنظيف التنبيهات القديمة
     * Cleanup old alerts
     */
    cleanupOldAlerts() {
        const oneDayAgo = Date.now() - 86400000; // 24 hours
        this.alerts = this.alerts.filter(alert => alert.timestamp > oneDayAgo);
    }

    /**
     * إعداد قاعدة تنبيه جديدة
     * Setup new alert rule
     */
    addAlertRule(rule) {
        const alertRule = {
            id: this.generateId(),
            ...rule,
            createdAt: Date.now()
        };

        this.alertRules.push(alertRule);
        this.saveConfig();
        this.triggerEvent('alertRuleAdded', alertRule);
    }

    /**
     * إزالة قاعدة تنبيه
     * Remove alert rule
     */
    removeAlertRule(ruleId) {
        const index = this.alertRules.findIndex(rule => rule.id === ruleId);
        if (index !== -1) {
            const removedRule = this.alertRules.splice(index, 1)[0];
            this.saveConfig();
            this.triggerEvent('alertRuleRemoved', removedRule);
        }
    }

    /**
     * الحصول على التنبيهات
     * Get alerts
     */
    getAlerts(limit = 50, severity = null) {
        let filteredAlerts = this.alerts;
        
        if (severity) {
            filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
        }
        
        return filteredAlerts
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * الحصول على المقاييس
     * Get metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            uptime: this.isMonitoring ? Date.now() - this.startTime : 0,
            alertCount: this.alerts.length,
            timestamp: Date.now()
        };
    }

    /**
     * الحصول على الإحصائيات
     * Get statistics
     */
    getStatistics() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        const oneDayAgo = now - 86400000;

        const recentAlerts = this.alerts.filter(alert => alert.timestamp > oneHourAgo);
        const dailyAlerts = this.alerts.filter(alert => alert.timestamp > oneDayAgo);

        const severityCounts = this.alerts.reduce((counts, alert) => {
            counts[alert.severity] = (counts[alert.severity] || 0) + 1;
            return counts;
        }, {});

        const typeCounts = this.alerts.reduce((counts, alert) => {
            counts[alert.type] = (counts[alert.type] || 0) + 1;
            return counts;
        }, {});

        return {
            totalAlerts: this.alerts.length,
            recentAlerts: recentAlerts.length,
            dailyAlerts: dailyAlerts.length,
            severityCounts,
            typeCounts,
            avgResponseTime: this.metrics.responseTime,
            uptime: this.isMonitoring ? now - this.startTime : 0
        };
    }

    /**
     * تصدير البيانات
     * Export data
     */
    exportData(format = 'json') {
        const data = {
            alerts: this.alerts,
            metrics: this.metrics,
            alertRules: this.alertRules,
            statistics: this.getStatistics(),
            exportDate: new Date().toISOString()
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `security-monitor-${timestamp}.${format}`;

        if (format === 'json') {
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            
            URL.revokeObjectURL(url);
        }
    }

    /**
     * طلب إذن الإشعارات
     * Request notification permission
     */
    requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                this.triggerEvent('notificationPermissionChanged', { permission });
            });
        }
    }

    /**
     * حفظ الإعدادات
     * Save configuration
     */
    saveConfig() {
        const config = {
            thresholds: this.thresholds,
            alertRules: this.alertRules,
            lastSaved: Date.now()
        };
        localStorage.setItem('securityMonitorConfig', JSON.stringify(config));
    }

    /**
     * تحميل الإعدادات المحفوظة
     * Load saved configuration
     */
    loadSavedConfig() {
        try {
            const saved = localStorage.getItem('securityMonitorConfig');
            if (saved) {
                const config = JSON.parse(saved);
                this.thresholds = { ...this.thresholds, ...config.thresholds };
                this.alertRules = config.alertRules || [];
            }
        } catch (error) {
            console.error('خطأ في تحميل الإعدادات:', error);
        }
    }

    /**
     * تهيئة المقاييس
     * Initialize metrics
     */
    initializeMetrics() {
        this.startTime = Date.now();
        this.lastRequestTime = new Map();
    }

    /**
     * الحصول على وقت الطلب
     * Get request time
     */
    getRequestTime(type) {
        return this.lastRequestTime.get(type) || Date.now();
    }

    /**
     * تسجيل حدث
     * Register event
     */
    on(eventName, handler) {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName).push(handler);
    }

    /**
     * إلغاء تسجيل حدث
     * Unregister event
     */
    off(eventName, handler) {
        if (this.eventHandlers.has(eventName)) {
            const handlers = this.eventHandlers.get(eventName);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * تشغيل حدث
     * Trigger event
     */
    triggerEvent(eventName, data) {
        if (this.eventHandlers.has(eventName)) {
            this.eventHandlers.get(eventName).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('خطأ في معالج الحدث:', error);
                }
            });
        }
    }

    /**
     * توليد معرف فريد
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * تنظيف الموارد
     * Cleanup resources
     */
    destroy() {
        this.stopMonitoring();
        
        if (this.domObserver) {
            this.domObserver.disconnect();
        }
        
        this.eventHandlers.clear();
        this.alerts = [];
        this.metrics = {
            requests: 0,
            blockedRequests: 0,
            threats: 0,
            responseTime: 0,
            errors: 0
        };
        
        console.log('تم تنظيف نظام المراقبة الأمنية');
    }
}

// إنشاء مثيل عام للنظام
const securityMonitor = new SecurityMonitor();

// تصدير للاستخدام العام
window.SecurityMonitor = SecurityMonitor;
window.securityMonitor = securityMonitor;