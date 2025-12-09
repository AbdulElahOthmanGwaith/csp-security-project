/**
 * لوحة معلومات الأمان الشاملة
 * Comprehensive Security Dashboard
 * Real-time security monitoring and analytics platform
 */

class SecurityDashboard {
    constructor() {
        this.data = {
            threats: [],
            metrics: {},
            alerts: [],
            trends: [],
            reports: []
        };
        
        this.widgets = new Map();
        this.updateInterval = null;
        this.realTimeMonitor = null;
        this.isRealTimeEnabled = false;
        this.dashboardConfig = this.loadConfig();
        
        this.init();
    }

    /**
     * تهيئة لوحة المعلومات
     * Initialize dashboard
     */
    init() {
        this.setupRealTimeMonitoring();
        this.initializeWidgets();
        this.loadHistoricalData();
        this.startPeriodicUpdates();
    }

    /**
     * إعداد المراقبة في الوقت الفعلي
     * Setup real-time monitoring
     */
    setupRealTimeMonitoring() {
        if (window.securityMonitor) {
            this.realTimeMonitor = window.securityMonitor;
            
            // الاستماع لأحداث المراقبة
            this.realTimeMonitor.on('alertTriggered', (alert) => {
                this.addThreat(alert);
                this.updateThreatMetrics();
            });
            
            this.realTimeMonitor.on('metricsCollected', (metrics) => {
                this.updateMetrics(metrics);
            });
        }
    }

    /**
     * تهيئة الأدوات
     * Initialize widgets
     */
    initializeWidgets() {
        this.widgets.set('threat-overview', new ThreatOverviewWidget());
        this.widgets.set('security-score', new SecurityScoreWidget());
        this.widgets.set('real-time-alerts', new RealTimeAlertsWidget());
        this.widgets.set('threat-trends', new ThreatTrendsWidget());
        this.widgets.set('compliance-status', new ComplianceStatusWidget());
        this.widgets.set('incident-timeline', new IncidentTimelineWidget());
        this.widgets.set('security-policies', new SecurityPoliciesWidget());
        this.widgets.set('performance-metrics', new PerformanceMetricsWidget());
    }

    /**
     * إضافة تهديد جديد
     * Add new threat
     */
    addThreat(threatData) {
        const threat = {
            id: this.generateId(),
            ...threatData,
            timestamp: threatData.timestamp || Date.now(),
            status: 'new',
            severity: threatData.severity || 'medium',
            type: threatData.type || 'unknown',
            source: threatData.source || 'unknown'
        };

        this.data.threats.unshift(threat);
        
        // الاحتفاظ بآخر 1000 تهديد فقط
        if (this.data.threats.length > 1000) {
            this.data.threats = this.data.threats.slice(0, 1000);
        }

        this.saveThreatData();
        this.notifyThreatUpdate(threat);
    }

    /**
     * تحديث المقاييس
     * Update metrics
     */
    updateMetrics(newMetrics) {
        this.data.metrics = {
            ...this.data.metrics,
            ...newMetrics,
            lastUpdate: Date.now()
        };

        this.saveMetricsData();
    }

    /**
     * الحصول على نظرة عامة على التهديدات
     * Get threat overview
     */
    getThreatOverview() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        const oneDayAgo = now - 86400000;
        const oneWeekAgo = now - 604800000;

        const recentThreats = this.data.threats.filter(t => t.timestamp > oneHourAgo);
        const dailyThreats = this.data.threats.filter(t => t.timestamp > oneDayAgo);
        const weeklyThreats = this.data.threats.filter(t => t.timestamp > oneWeekAgo);

        const severityCounts = {
            critical: this.data.threats.filter(t => t.severity === 'critical').length,
            high: this.data.threats.filter(t => t.severity === 'high').length,
            medium: this.data.threats.filter(t => t.severity === 'medium').length,
            low: this.data.threats.filter(t => t.severity === 'low').length,
            info: this.data.threats.filter(t => t.severity === 'info').length
        };

        const typeCounts = this.data.threats.reduce((counts, threat) => {
            counts[threat.type] = (counts[threat.type] || 0) + 1;
            return counts;
        }, {});

        return {
            total: this.data.threats.length,
            recent: recentThreats.length,
            daily: dailyThreats.length,
            weekly: weeklyThreats.length,
            severityCounts,
            typeCounts,
            averagePerDay: Math.round(dailyThreats.length / 7),
            trend: this.calculateThreatTrend()
        };
    }

    /**
     * حساب اتجاه التهديدات
     * Calculate threat trend
     */
    calculateThreatTrend() {
        const now = Date.now();
        const oneDayAgo = now - 86400000;
        const twoDaysAgo = now - 172800000;
        const threeDaysAgo = now - 259200000;

        const last24h = this.data.threats.filter(t => t.timestamp > oneDayAgo).length;
        const previous24h = this.data.threats.filter(t => 
            t.timestamp > twoDaysAgo && t.timestamp <= oneDayAgo
        ).length;
        const previous48h = this.data.threats.filter(t => 
            t.timestamp > threeDaysAgo && t.timestamp <= twoDaysAgo
        ).length;

        const currentRate = last24h;
        const previousRate = (previous24h + previous48h) / 2;
        
        if (currentRate > previousRate * 1.2) {
            return { direction: 'increasing', percentage: Math.round(((currentRate - previousRate) / previousRate) * 100) };
        } else if (currentRate < previousRate * 0.8) {
            return { direction: 'decreasing', percentage: Math.round(((previousRate - currentRate) / previousRate) * 100) };
        } else {
            return { direction: 'stable', percentage: 0 };
        }
    }

    /**
     * الحصول على درجة الأمان
     * Get security score
     */
    getSecurityScore() {
        const overview = this.getThreatOverview();
        let score = 100;

        // خصم النقاط بناءً على التهديدات
        score -= overview.severityCounts.critical * 10;
        score -= overview.severityCounts.high * 5;
        score -= overview.severityCounts.medium * 2;
        score -= overview.severityCounts.low * 1;

        // خصم النقاط بناءً على العدد الإجمالي
        if (overview.total > 100) score -= 20;
        else if (overview.total > 50) score -= 10;
        else if (overview.total > 20) score -= 5;

        // ضمان أن النتيجة بين 0 و 100
        score = Math.max(0, Math.min(100, score));

        // تحديد المستوى
        let level, color, description;
        if (score >= 90) {
            level = 'ممتاز';
            color = '#00C851';
            description = 'مستوى أمان عالي جداً';
        } else if (score >= 75) {
            level = 'جيد';
            color = '#00C851';
            description = 'مستوى أمان جيد';
        } else if (score >= 60) {
            level = 'مقبول';
            color = '#FFBB33';
            description = 'مستوى أمان مقبول';
        } else if (score >= 40) {
            level = 'ضعيف';
            color = '#FF8800';
            description = 'يحتاج تحسين';
        } else {
            level = 'خطر';
            color = '#FF4444';
            description = 'مستوى خطر عالي';
        }

        return {
            score: Math.round(score),
            level,
            color,
            description,
            lastCalculation: Date.now()
        };
    }

    /**
     * الحصول على اتجاه التهديدات
     * Get threat trends
     */
    getThreatTrends(days = 7) {
        const trends = [];
        const now = Date.now();
        
        for (let i = days - 1; i >= 0; i--) {
            const dayStart = new Date(now - (i * 86400000));
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const dayThreats = this.data.threats.filter(t => 
                t.timestamp >= dayStart.getTime() && t.timestamp <= dayEnd.getTime()
            );

            trends.push({
                date: dayStart.toISOString().split('T')[0],
                total: dayThreats.length,
                critical: dayThreats.filter(t => t.severity === 'critical').length,
                high: dayThreats.filter(t => t.severity === 'high').length,
                medium: dayThreats.filter(t => t.severity === 'medium').length,
                low: dayThreats.filter(t => t.severity === 'low').length,
                info: dayThreats.filter(t => t.severity === 'info').length
            });
        }

        return trends;
    }

    /**
     * الحصول على حالة الامتثال
     * Get compliance status
     */
    getComplianceStatus() {
        const checks = [
            {
                name: 'Content Security Policy',
                status: this.checkCSPCompliance(),
                description: 'فحص وجود وتطبيق CSP',
                severity: 'high'
            },
            {
                name: 'HTTPS Enforcement',
                status: this.checkHTTPSCompliance(),
                description: 'فرض استخدام HTTPS',
                severity: 'critical'
            },
            {
                name: 'X-Frame-Options',
                status: this.checkXFrameOptionsCompliance(),
                description: 'حماية من clickjacking',
                severity: 'medium'
            },
            {
                name: 'X-Content-Type-Options',
                status: this.checkXContentTypeOptionsCompliance(),
                description: 'منع MIME type sniffing',
                severity: 'low'
            },
            {
                name: 'CSRF Protection',
                status: this.checkCSRFCompliance(),
                description: 'حماية من CSRF attacks',
                severity: 'high'
            },
            {
                name: 'Input Validation',
                status: this.checkInputValidationCompliance(),
                description: 'التحقق من المدخلات',
                severity: 'medium'
            }
        ];

        const passed = checks.filter(check => check.status === 'passed').length;
        const failed = checks.filter(check => check.status === 'failed').length;
        const warning = checks.filter(check => check.status === 'warning').length;

        return {
            checks,
            summary: {
                total: checks.length,
                passed,
                failed,
                warning,
                complianceRate: Math.round((passed / checks.length) * 100)
            }
        };
    }

    /**
     * فحص امتثال CSP
     * Check CSP compliance
     */
    checkCSPCompliance() {
        // محاكاة فحص CSP (في التطبيق الحقيقي تحتاج API)
        const hasCSP = this.data.metrics.cspImplemented || false;
        const isStrict = this.data.metrics.cspStrict || false;
        
        if (!hasCSP) return 'failed';
        if (!isStrict) return 'warning';
        return 'passed';
    }

    /**
     * فحص امتثال HTTPS
     * Check HTTPS compliance
     */
    checkHTTPSCompliance() {
        // محاكاة فحص HTTPS
        const isHTTPS = window.location.protocol === 'https:';
        const hasHSTS = this.data.metrics.hstsImplemented || false;
        
        if (!isHTTPS) return 'failed';
        if (!hasHSTS) return 'warning';
        return 'passed';
    }

    /**
     * فحص امتثال X-Frame-Options
     * Check X-Frame-Options compliance
     */
    checkXFrameOptionsCompliance() {
        // محاكاة فحص X-Frame-Options
        return this.data.metrics.xFrameOptionsImplemented ? 'passed' : 'warning';
    }

    /**
     * فحص امتثال X-Content-Type-Options
     * Check X-Content-Type-Options compliance
     */
    checkXContentTypeOptionsCompliance() {
        // محاكاة فحص X-Content-Type-Options
        return this.data.metrics.xContentTypeOptionsImplemented ? 'passed' : 'warning';
    }

    /**
     * فحص امتثال CSRF
     * Check CSRF compliance
     */
    checkCSRFCompliance() {
        // محاكاة فحص CSRF
        return this.data.metrics.csrfProtectionImplemented ? 'passed' : 'failed';
    }

    /**
     * فحص امتثال التحقق من المدخلات
     * Check input validation compliance
     */
    checkInputValidationCompliance() {
        // محاكاة فحص التحقق من المدخلات
        return this.data.metrics.inputValidationImplemented ? 'passed' : 'warning';
    }

    /**
     * الحصول على الجدول الزمني للحوادث
     * Get incident timeline
     */
    getIncidentTimeline(limit = 50) {
        const incidents = this.data.threats
            .filter(threat => threat.severity === 'critical' || threat.severity === 'high')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);

        return incidents.map(incident => ({
            id: incident.id,
            timestamp: incident.timestamp,
            type: incident.type,
            severity: incident.severity,
            description: incident.message || incident.description,
            status: incident.status,
            actions: this.getIncidentActions(incident.id)
        }));
    }

    /**
     * الحصول على إجراءات الحادث
     * Get incident actions
     */
    getIncidentActions(incidentId) {
        // في التطبيق الحقيقي، ستحمل من قاعدة البيانات
        return [
            {
                id: this.generateId(),
                timestamp: Date.now(),
                action: 'incident_detected',
                description: 'تم اكتشاف الحادث',
                user: 'النظام'
            },
            {
                id: this.generateId(),
                timestamp: Date.now() + 300000, // 5 minutes later
                action: 'alert_sent',
                description: 'تم إرسال تنبيه',
                user: 'النظام'
            }
        ];
    }

    /**
     * الحصول على سياسات الأمان
     * Get security policies
     */
    getSecurityPolicies() {
        return [
            {
                id: 'csp-main',
                name: 'سياسة أمان المحتوى الرئيسية',
                status: 'active',
                lastModified: Date.now() - 86400000,
                violations: this.getPolicyViolations('csp'),
                compliance: this.calculatePolicyCompliance('csp')
            },
            {
                id: 'csrf-protection',
                name: 'سياسة حماية CSRF',
                status: 'active',
                lastModified: Date.now() - 172800000,
                violations: this.getPolicyViolations('csrf'),
                compliance: this.calculatePolicyCompliance('csrf')
            },
            {
                id: 'input-validation',
                name: 'سياسة التحقق من المدخلات',
                status: 'active',
                lastModified: Date.now() - 259200000,
                violations: this.getPolicyViolations('input-validation'),
                compliance: this.calculatePolicyCompliance('input-validation')
            }
        ];
    }

    /**
     * الحصول على انتهاكات السياسة
     * Get policy violations
     */
    getPolicyViolations(policyId) {
        return this.data.threats.filter(threat => 
            threat.policyId === policyId || 
            (policyId === 'csp' && threat.type.includes('csp')) ||
            (policyId === 'csrf' && threat.type.includes('csrf')) ||
            (policyId === 'input-validation' && threat.type.includes('injection'))
        ).length;
    }

    /**
     * حساب امتثال السياسة
     * Calculate policy compliance
     */
    calculatePolicyCompliance(policyId) {
        const violations = this.getPolicyViolations(policyId);
        const totalRequests = this.data.metrics.requests || 1000;
        const violationRate = (violations / totalRequests) * 100;
        
        return Math.max(0, 100 - violationRate);
    }

    /**
     * الحصول على مقاييس الأداء
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            responseTime: {
                average: this.data.metrics.averageResponseTime || 250,
                p95: this.data.metrics.p95ResponseTime || 500,
                p99: this.data.metrics.p99ResponseTime || 1000,
                unit: 'ms'
            },
            throughput: {
                current: this.data.metrics.currentThroughput || 100,
                peak: this.data.metrics.peakThroughput || 150,
                unit: 'requests/second'
            },
            errorRate: {
                current: this.data.metrics.errorRate || 0.5,
                threshold: 1.0,
                unit: '%'
            },
            availability: {
                current: this.data.metrics.availability || 99.9,
                target: 99.95,
                unit: '%'
            }
        };
    }

    /**
     * تفعيل التحديث في الوقت الفعلي
     * Enable real-time updates
     */
    enableRealTime() {
        if (this.isRealTimeEnabled) return;

        this.isRealTimeEnabled = true;
        this.updateInterval = setInterval(() => {
            this.updateAllWidgets();
            this.collectCurrentMetrics();
        }, 5000); // تحديث كل 5 ثوان

        if (this.realTimeMonitor && !this.realTimeMonitor.isMonitoring) {
            this.realTimeMonitor.startMonitoring();
        }
    }

    /**
     * إلغاء تفعيل التحديث في الوقت الفعلي
     * Disable real-time updates
     */
    disableRealTime() {
        this.isRealTimeEnabled = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * تحديث جميع الأدوات
     * Update all widgets
     */
    updateAllWidgets() {
        this.widgets.forEach((widget, widgetId) => {
            try {
                const data = this.getWidgetData(widgetId);
                widget.update(data);
            } catch (error) {
                console.error(`خطأ في تحديث widget ${widgetId}:`, error);
            }
        });
    }

    /**
     * الحصول على بيانات الأداة
     * Get widget data
     */
    getWidgetData(widgetId) {
        switch (widgetId) {
            case 'threat-overview':
                return this.getThreatOverview();
            case 'security-score':
                return this.getSecurityScore();
            case 'real-time-alerts':
                return this.data.alerts.slice(0, 10);
            case 'threat-trends':
                return this.getThreatTrends();
            case 'compliance-status':
                return this.getComplianceStatus();
            case 'incident-timeline':
                return this.getIncidentTimeline();
            case 'security-policies':
                return this.getSecurityPolicies();
            case 'performance-metrics':
                return this.getPerformanceMetrics();
            default:
                return {};
        }
    }

    /**
     * جمع المقاييس الحالية
     * Collect current metrics
     */
    collectCurrentMetrics() {
        if (this.realTimeMonitor) {
            const metrics = this.realTimeMonitor.getMetrics();
            this.updateMetrics(metrics);
        }
    }

    /**
     * تحميل البيانات التاريخية
     * Load historical data
     */
    loadHistoricalData() {
        try {
            const saved = localStorage.getItem('securityDashboardData');
            if (saved) {
                const data = JSON.parse(saved);
                this.data = { ...this.data, ...data };
            }
        } catch (error) {
            console.error('خطأ في تحميل البيانات التاريخية:', error);
        }
    }

    /**
     * حفظ بيانات التهديدات
     * Save threat data
     */
    saveThreatData() {
        try {
            localStorage.setItem('securityDashboardThreats', JSON.stringify(this.data.threats));
        } catch (error) {
            console.error('خطأ في حفظ بيانات التهديدات:', error);
        }
    }

    /**
     * حفظ بيانات المقاييس
     * Save metrics data
     */
    saveMetricsData() {
        try {
            localStorage.setItem('securityDashboardMetrics', JSON.stringify(this.data.metrics));
        } catch (error) {
            console.error('خطأ في حفظ بيانات المقاييس:', error);
        }
    }

    /**
     * تحميل التكوين
     * Load configuration
     */
    loadConfig() {
        try {
            const saved = localStorage.getItem('securityDashboardConfig');
            return saved ? JSON.parse(saved) : {
                refreshInterval: 5000,
                enableNotifications: true,
                enableRealTime: true,
                theme: 'dark',
                widgets: Array.from(this.widgets.keys())
            };
        } catch {
            return {
                refreshInterval: 5000,
                enableNotifications: true,
                enableRealTime: true,
                theme: 'dark',
                widgets: Array.from(this.widgets.keys())
            };
        }
    }

    /**
     * حفظ التكوين
     * Save configuration
     */
    saveConfig(config) {
        this.dashboardConfig = { ...this.dashboardConfig, ...config };
        localStorage.setItem('securityDashboardConfig', JSON.stringify(this.dashboardConfig));
    }

    /**
     * بدء التحديثات الدورية
     * Start periodic updates
     */
    startPeriodicUpdates() {
        if (this.dashboardConfig.enableRealTime) {
            this.enableRealTime();
        }
    }

    /**
     * إشعار تحديث التهديد
     * Notify threat update
     */
    notifyThreatUpdate(threat) {
        if (this.dashboardConfig.enableNotifications && Notification.permission === 'granted') {
            const severityColors = {
                critical: '#FF4444',
                high: '#FF8800',
                medium: '#FFAA00',
                low: '#FFDD00',
                info: '#44AA44'
            };

            new Notification(`تنبيه أمني: ${threat.severity}`, {
                body: threat.message || `تهديد جديد من نوع ${threat.type}`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: threat.id,
                requireInteraction: threat.severity === 'critical'
            });
        }
    }

    /**
     * توليد تقرير
     * Generate report
     */
    generateReport(type = 'summary', format = 'json') {
        const report = {
            id: this.generateId(),
            type: type,
            generatedAt: new Date().toISOString(),
            period: {
                start: Date.now() - 86400000, // آخر 24 ساعة
                end: Date.now()
            },
            data: {
                threatOverview: this.getThreatOverview(),
                securityScore: this.getSecurityScore(),
                complianceStatus: this.getComplianceStatus(),
                threatTrends: this.getThreatTrends(),
                performanceMetrics: this.getPerformanceMetrics(),
                recentThreats: this.data.threats.slice(0, 20)
            }
        };

        if (format === 'json') {
            const dataStr = JSON.stringify(report, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `security-report-${type}-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
        } else if (format === 'html') {
            const html = this.generateHTMLReport(report);
            const dataBlob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `security-report-${type}-${new Date().toISOString().split('T')[0]}.html`;
            link.click();
            
            URL.revokeObjectURL(url);
        }

        return report;
    }

    /**
     * توليد تقرير HTML
     * Generate HTML report
     */
    generateHTMLReport(report) {
        const { data } = report;
        
        return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير الأمان - ${report.type}</title>
    <style>
        body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; margin: 20px; background: #0A0A0A; color: #E0E0E0; }
        .header { background: linear-gradient(135deg, #00E0D5, #00B8B8); color: #0A0A0A; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .section { background: #1A1A1A; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #333; }
        .metric { display: inline-block; background: #2A2A2A; padding: 15px; margin: 10px; border-radius: 8px; min-width: 150px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #00E0D5; }
        .metric-label { color: #888; margin-top: 5px; }
        .severity-critical { color: #FF4444; }
        .severity-high { color: #FF8800; }
        .severity-medium { color: #FFAA00; }
        .severity-low { color: #FFDD00; }
        .severity-info { color: #44AA44; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: right; border-bottom: 1px solid #333; }
        th { background: #2A2A2A; color: #00E0D5; }
        .status-passed { color: #00C851; }
        .status-failed { color: #FF4444; }
        .status-warning { color: #FFAA00; }
    </style>
</head>
<body>
    <div class="header">
        <h1>تقرير الأمان الأمني</h1>
        <p>Security Report - ${report.type}</p>
        <p>تاريخ التوليد: ${new Date(report.generatedAt).toLocaleString('ar-SA')}</p>
    </div>

    <div class="section">
        <h2>نظرة عامة على التهديدات</h2>
        <div class="metric">
            <div class="metric-value">${data.threatOverview.total}</div>
            <div class="metric-label">إجمالي التهديدات</div>
        </div>
        <div class="metric">
            <div class="metric-value">${data.threatOverview.recent}</div>
            <div class="metric-label">آخر ساعة</div>
        </div>
        <div class="metric">
            <div class="metric-value">${data.threatOverview.daily}</div>
            <div class="metric-label">آخر يوم</div>
        </div>
    </div>

    <div class="section">
        <h2>درجة الأمان</h2>
        <div class="metric">
            <div class="metric-value" style="color: ${data.securityScore.color};">${data.securityScore.score}</div>
            <div class="metric-label">${data.securityScore.level}</div>
        </div>
        <p>${data.securityScore.description}</p>
    </div>

    <div class="section">
        <h2>توزيع التهديدات حسب الخطورة</h2>
        <table>
            <tr>
                <th>الخطورة</th>
                <th>العدد</th>
            </tr>
            <tr>
                <td class="severity-critical">حرج</td>
                <td>${data.threatOverview.severityCounts.critical}</td>
            </tr>
            <tr>
                <td class="severity-high">عالي</td>
                <td>${data.threatOverview.severityCounts.high}</td>
            </tr>
            <tr>
                <td class="severity-medium">متوسط</td>
                <td>${data.threatOverview.severityCounts.medium}</td>
            </tr>
            <tr>
                <td class="severity-low">منخفض</td>
                <td>${data.threatOverview.severityCounts.low}</td>
            </tr>
            <tr>
                <td class="severity-info">معلوماتي</td>
                <td>${data.threatOverview.severityCounts.info}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>حالة الامتثال</h2>
        <table>
            <tr>
                <th>الفحص</th>
                <th>الحالة</th>
                <th>الوصف</th>
            </tr>
            ${data.complianceStatus.checks.map(check => `
                <tr>
                    <td>${check.name}</td>
                    <td class="status-${check.status}">${check.status === 'passed' ? 'نجح' : check.status === 'failed' ? 'فشل' : 'تحذير'}</td>
                    <td>${check.description}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    <div class="section">
        <h2>التهديدات الحديثة</h2>
        <table>
            <tr>
                <th>الوقت</th>
                <th>النوع</th>
                <th>الخطورة</th>
                <th>الوصف</th>
            </tr>
            ${data.recentThreats.map(threat => `
                <tr>
                    <td>${new Date(threat.timestamp).toLocaleString('ar-SA')}</td>
                    <td>${threat.type}</td>
                    <td class="severity-${threat.severity}">${threat.severity}</td>
                    <td>${threat.message || threat.description || 'لا يوجد وصف'}</td>
                </tr>
            `).join('')}
        </table>
    </div>
</body>
</html>`;
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
        this.disableRealTime();
        this.widgets.clear();
        
        if (this.realTimeMonitor) {
            this.realTimeMonitor.destroy();
        }
    }
}

/**
 * أداة نظرة عامة على التهديدات
 * Threat Overview Widget
 */
class ThreatOverviewWidget {
    constructor() {
        this.container = null;
        this.chart = null;
    }

    mount(container) {
        this.container = container;
        this.render();
    }

    update(data) {
        if (!this.container) return;
        
        this.updateThreatCounts(data);
        this.updateCharts(data);
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="widget-header">
                <h3>نظرة عامة على التهديدات</h3>
                <div class="widget-controls">
                    <button class="refresh-btn" onclick="dashboard.updateAllWidgets()">تحديث</button>
                </div>
            </div>
            <div class="threat-overview-content">
                <div class="threat-stats">
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">إجمالي التهديدات</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">آخر ساعة</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">0</div>
                        <div class="stat-label">آخر يوم</div>
                    </div>
                </div>
                <div class="severity-breakdown">
                    <h4>توزيع التهديدات حسب الخطورة</h4>
                    <div class="severity-chart">
                        <canvas id="severityChart" width="300" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    updateThreatCounts(data) {
        const statCards = this.container.querySelectorAll('.stat-card .stat-value');
        if (statCards.length >= 3) {
            statCards[0].textContent = data.total || 0;
            statCards[1].textContent = data.recent || 0;
            statCards[2].textContent = data.daily || 0;
        }
    }

    updateCharts(data) {
        const canvas = this.container.querySelector('#severityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const severityData = data.severityCounts || {};

        // رسم مخطط دائري بسيط
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        const colors = {
            critical: '#FF4444',
            high: '#FF8800',
            medium: '#FFAA00',
            low: '#FFDD00',
            info: '#44AA44'
        };

        let currentAngle = 0;
        const total = Object.values(severityData).reduce((sum, count) => sum + count, 0);

        Object.entries(severityData).forEach(([severity, count]) => {
            if (count > 0) {
                const sliceAngle = (count / total) * 2 * Math.PI;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.lineTo(centerX, centerY);
                ctx.fillStyle = colors[severity] || '#666';
                ctx.fill();
                
                currentAngle += sliceAngle;
            }
        });

        // إضافة وسيلة الإيضاح
        const legendY = canvas.height - 60;
        let legendX = 10;
        
        Object.entries(severityData).forEach(([severity, count]) => {
            if (count > 0) {
                ctx.fillStyle = colors[severity] || '#666';
                ctx.fillRect(legendX, legendY, 15, 15);
                ctx.fillStyle = '#E0E0E0';
                ctx.font = '12px Arial';
                ctx.fillText(`${severity}: ${count}`, legendX + 20, legendY + 12);
                legendX += 80;
            }
        });
    }
}

/**
 * أداة درجة الأمان
 * Security Score Widget
 */
class SecurityScoreWidget {
    constructor() {
        this.container = null;
    }

    mount(container) {
        this.container = container;
        this.render();
    }

    update(data) {
        if (!this.container) return;
        
        const scoreElement = this.container.querySelector('.security-score-value');
        const levelElement = this.container.querySelector('.security-score-level');
        const descriptionElement = this.container.querySelector('.security-score-description');
        
        if (scoreElement) {
            scoreElement.textContent = data.score || 0;
            scoreElement.style.color = data.color || '#00E0D5';
        }
        
        if (levelElement) {
            levelElement.textContent = data.level || 'غير معروف';
            levelElement.style.color = data.color || '#00E0D5';
        }
        
        if (descriptionElement) {
            descriptionElement.textContent = data.description || '';
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="widget-header">
                <h3>درجة الأمان</h3>
            </div>
            <div class="security-score-content">
                <div class="score-display">
                    <div class="security-score-value">0</div>
                    <div class="security-score-level">غير معروف</div>
                </div>
                <div class="security-score-description">
                    يتم حساب درجة الأمان بناءً على التهديدات المكتشفة والامتثال للمعايير الأمنية
                </div>
            </div>
        `;
    }
}

/**
 * أدوات أخرى مشابهة...
 * Similar other widgets...
 */
class RealTimeAlertsWidget {
    constructor() {
        this.container = null;
    }

    mount(container) {
        this.container = container;
        this.render();
    }

    update(data) {
        if (!this.container) return;
        
        const alertsList = this.container.querySelector('.alerts-list');
        if (alertsList) {
            alertsList.innerHTML = data.map(alert => `
                <div class="alert-item severity-${alert.severity}">
                    <div class="alert-time">${new Date(alert.timestamp).toLocaleTimeString('ar-SA')}</div>
                    <div class="alert-message">${alert.message || alert.description}</div>
                    <div class="alert-severity">${alert.severity}</div>
                </div>
            `).join('');
        }
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="widget-header">
                <h3>التنبيهات في الوقت الفعلي</h3>
            </div>
            <div class="alerts-list">
                <div class="no-alerts">لا توجد تنبيهات جديدة</div>
            </div>
        `;
    }
}

// أدوات إضافية...
class ThreatTrendsWidget {}
class ComplianceStatusWidget {}
class IncidentTimelineWidget {}
class SecurityPoliciesWidget {}
class PerformanceMetricsWidget {}

// تصدير الكلاسات للاستخدام
window.SecurityDashboard = SecurityDashboard;
window.ThreatOverviewWidget = ThreatOverviewWidget;
window.SecurityScoreWidget = SecurityScoreWidget;
window.RealTimeAlertsWidget = RealTimeAlertsWidget;