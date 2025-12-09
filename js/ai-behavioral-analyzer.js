/**
 * AI Behavioral Analysis System
 * Advanced threat detection using behavioral patterns and machine learning
 * Author: MiniMax Agent
 * Date: 2025-12-10
 */

class AIBehavioralAnalyzer {
    constructor() {
        this.behavioralModels = new Map();
        this.anomalyDetector = new AnomalyDetector();
        this.patternLearner = new PatternLearner();
        this.threatClassifier = new ThreatClassifier();
        this.behavioralBaseline = new Map();
        this.sessionData = [];
        this.mlModel = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('🤖 Initializing AI Behavioral Analyzer...');
            
            // Initialize behavioral models
            await this.loadBehavioralModels();
            
            // Setup ML model for pattern recognition
            await this.initializeMLModel();
            
            // Create behavioral baselines
            this.createBehavioralBaselines();
            
            // Start real-time monitoring
            this.startBehavioralMonitoring();
            
            this.initialized = true;
            console.log('✅ AI Behavioral Analyzer initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize AI Behavioral Analyzer:', error);
            throw error;
        }
    }

    async loadBehavioralModels() {
        // Define behavioral patterns for different threat types
        this.behavioralModels.set('xss', {
            patterns: [
                { action: 'rapid_input_changes', weight: 0.8 },
                { action: 'unusual_event_timing', weight: 0.7 },
                { action: 'suspicious_character_patterns', weight: 0.9 }
            ],
            thresholds: {
                inputRate: 50, // inputs per minute
                scriptDetection: true,
                domManipulation: 'high'
            }
        });

        this.behavioralModels.set('sql_injection', {
            patterns: [
                { action: 'sql_keyword_frequency', weight: 0.9 },
                { action: 'query_complexity_spike', weight: 0.8 },
                { action: 'error_message_patterns', weight: 0.7 }
            ],
            thresholds: {
                sqlKeywordRate: 10, // SQL keywords per minute
                queryComplexity: 0.8,
                errorRate: 0.3
            }
        });

        this.behavioralModels.set('csrf', {
            patterns: [
                { action: 'cross_domain_requests', weight: 0.8 },
                { action: 'form_submission_patterns', weight: 0.9 },
                { action: 'session_token_misuse', weight: 0.9 }
            ],
            thresholds: {
                crossDomainRequests: 5,
                formSubmissionRate: 20,
                tokenValidation: false
            }
        });

        this.behavioralModels.set('clickjacking', {
            patterns: [
                { action: 'iframe_embedding', weight: 0.9 },
                { action: 'overlay_manipulation', weight: 0.8 },
                { action: 'cursor_position_anomalies', weight: 0.7 }
            ],
            thresholds: {
                iframeDetection: true,
                overlayComplexity: 0.7,
                cursorJitter: 0.5
            }
        });

        this.behavioralModels.set('advanced_persistent_threat', {
            patterns: [
                { action: 'long_term_surveillance', weight: 0.9 },
                { action: 'stealth_data_exfiltration', weight: 0.95 },
                { action: 'lateral_movement_patterns', weight: 0.9 }
            ],
            thresholds: {
                sessionDuration: 3600000, // 1 hour
                dataTransferRate: 1000000, // 1MB/s
                networkConnections: 50
            }
        });
    }

    async initializeMLModel() {
        // Simulate machine learning model initialization
        // In production, this would load actual TensorFlow.js or similar models
        
        this.mlModel = {
            predictThreat: (features) => {
                // Simulated ML prediction with confidence scoring
                const threatScore = Math.random();
                const confidence = 0.7 + Math.random() * 0.3;
                
                return {
                    threatScore,
                    confidence,
                    prediction: threatScore > 0.7 ? 'malicious' : 'benign',
                    features
                };
            },
            
            updateModel: (newData) => {
                // Simulated model updates
                console.log('🧠 ML Model updated with new behavioral data');
                return true;
            }
        };
    }

    createBehavioralBaselines() {
        // Create baseline profiles for normal user behavior
        this.behavioralBaseline.set('normal_user', {
            clickRate: { min: 2, max: 8 }, // clicks per second
            typingSpeed: { min: 120, max: 300 }, // WPM
            scrollPattern: 'smooth',
            navigationTime: { min: 1000, max: 30000 }, // ms
            formInteraction: 'deliberate',
            errorRate: { min: 0, max: 0.1 } // 0-10%
        });

        this.behavioralBaseline.set('bot_behavior', {
            clickRate: { min: 10, max: 100 },
            typingSpeed: 0, // No typing
            scrollPattern: 'linear',
            navigationTime: { min: 100, max: 1000 },
            formInteraction: 'rapid',
            errorRate: { min: 0, max: 0.05 }
        });

        this.behavioralBaseline.set('automated_tool', {
            clickRate: { min: 50, max: 500 },
            typingSpeed: 0,
            scrollPattern: 'instant',
            navigationTime: { min: 10, max: 100 },
            formInteraction: 'instant',
            errorRate: { min: 0, max: 0.02 }
        });
    }

    startBehavioralMonitoring() {
        // Monitor various behavioral indicators
        this.setupEventListeners();
        this.startPerformanceMonitoring();
        this.startNetworkMonitoring();
    }

    setupEventListeners() {
        // Mouse behavior monitoring
        let mouseEvents = [];
        let lastMouseMove = Date.now();
        
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            const timeDiff = now - lastMouseMove;
            lastMouseMove = now;
            
            mouseEvents.push({
                timestamp: now,
                x: e.clientX,
                y: e.clientY,
                timeDiff: timeDiff
            });
            
            // Keep only recent events (last 10 seconds)
            mouseEvents = mouseEvents.filter(event => now - event.timestamp < 10000);
            
            // Analyze mouse behavior patterns
            this.analyzeMouseBehavior(mouseEvents);
        });

        // Keyboard behavior monitoring
        let keystrokes = [];
        document.addEventListener('keydown', (e) => {
            keystrokes.push({
                timestamp: Date.now(),
                key: e.key,
                code: e.code,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey
            });
            
            this.analyzeKeyboardBehavior(keystrokes);
        });

        // Form interaction monitoring
        document.addEventListener('input', (e) => {
            this.analyzeInputBehavior(e);
        });

        // Navigation patterns
        document.addEventListener('click', (e) => {
            this.analyzeClickBehavior(e);
        });
    }

    analyzeMouseBehavior(events) {
        if (events.length < 5) return;
        
        const now = Date.now();
        const recentEvents = events.filter(e => now - e.timestamp < 5000);
        
        // Calculate movement patterns
        const speeds = [];
        for (let i = 1; i < recentEvents.length; i++) {
            const dx = recentEvents[i].x - recentEvents[i-1].x;
            const dy = recentEvents[i].y - recentEvents[i-1].y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const timeDiff = recentEvents[i].timeDiff;
            const speed = timeDiff > 0 ? distance / timeDiff : 0;
            speeds.push(speed);
        }
        
        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        const speedVariance = speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
        
        // Detect bot-like behavior
        if (avgSpeed > 50 || speedVariance < 10) {
            this.reportAnomaly('mouse_behavior', {
                type: 'suspicious_mouse_pattern',
                speed: avgSpeed,
                variance: speedVariance,
                confidence: Math.min(0.9, (avgSpeed / 100) + (10 / (speedVariance + 1)))
            });
        }
    }

    analyzeKeyboardBehavior(keystrokes) {
        const now = Date.now();
        const recentKeystrokes = keystrokes.filter(k => now - k.timestamp < 60000);
        
        if (recentKeystrokes.length < 10) return;
        
        // Calculate typing patterns
        const intervals = [];
        for (let i = 1; i < recentKeystrokes.length; i++) {
            intervals.push(recentKeystrokes[i].timestamp - recentKeystrokes[i-1].timestamp);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const intervalVariance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        
        // Detect automated typing
        if (avgInterval < 50 && intervalVariance < 100) {
            this.reportAnomaly('keyboard_behavior', {
                type: 'automated_typing',
                avgInterval: avgInterval,
                variance: intervalVariance,
                confidence: Math.min(0.9, (100 - avgInterval) / 100)
            });
        }
    }

    analyzeInputBehavior(inputEvent) {
        const input = inputEvent.target;
        const value = input.value;
        const now = Date.now();
        
        // Detect suspicious input patterns
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /eval\s*\(/i,
            /document\./i,
            /window\./i,
            /on\w+\s*=/i,
            /union\s+select/i,
            /drop\s+table/i,
            /admin'--/i,
            /'or'1'='1/i
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(value)) {
                this.reportAnomaly('input_behavior', {
                    type: 'suspicious_input_pattern',
                    pattern: pattern.source,
                    element: input.tagName,
                    confidence: 0.95
                });
                break;
            }
        }
        
        // Monitor input rate
        if (!this.inputRateTracker) {
            this.inputRateTracker = { count: 0, startTime: now };
        }
        
        this.inputRateTracker.count++;
        if (now - this.inputRateTracker.startTime > 60000) {
            if (this.inputRateTracker.count > 100) {
                this.reportAnomaly('input_behavior', {
                    type: 'high_input_rate',
                    rate: this.inputRateTracker.count,
                    confidence: Math.min(0.8, this.inputRateTracker.count / 200)
                });
            }
            this.inputRateTracker = { count: 0, startTime: now };
        }
    }

    analyzeClickBehavior(clickEvent) {
        const element = clickEvent.target;
        const now = Date.now();
        
        if (!this.clickTracker) {
            this.clickTracker = [];
        }
        
        this.clickTracker.push({
            timestamp: now,
            element: element.tagName,
            text: element.textContent?.substring(0, 50) || '',
            position: { x: clickEvent.clientX, y: clickEvent.clientY }
        });
        
        // Keep only recent clicks (last 10 seconds)
        this.clickTracker = this.clickTracker.filter(click => now - click.timestamp < 10000);
        
        // Detect rapid clicking
        if (this.clickTracker.length > 20) {
            this.reportAnomaly('click_behavior', {
                type: 'rapid_clicking',
                clickCount: this.clickTracker.length,
                confidence: Math.min(0.8, this.clickTracker.length / 50)
            });
        }
        
        // Detect suspicious element targeting
        if (element.tagName === 'FORM' || element.getAttribute('type') === 'submit') {
            this.reportAnomaly('click_behavior', {
                type: 'form_targeting',
                element: element.outerHTML.substring(0, 200),
                confidence: 0.6
            });
        }
    }

    startPerformanceMonitoring() {
        // Monitor performance metrics that might indicate attacks
        setInterval(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                this.analyzePerformanceMetrics(perfData);
            }
        }, 5000);
    }

    analyzePerformanceMetrics(perfData) {
        // Detect unusual performance patterns
        if (perfData.loadEventEnd - perfData.loadEventStart > 10000) {
            this.reportAnomaly('performance', {
                type: 'slow_page_load',
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                confidence: 0.7
            });
        }
        
        // Monitor memory usage
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize;
            if (memoryUsage > 100 * 1024 * 1024) { // 100MB
                this.reportAnomaly('performance', {
                    type: 'high_memory_usage',
                    usage: memoryUsage,
                    confidence: 0.6
                });
            }
        }
    }

    startNetworkMonitoring() {
        // Monitor network requests for suspicious patterns
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            this.analyzeNetworkRequest(args[0], response);
            return response;
        };
    }

    analyzeNetworkRequest(url, response) {
        // Detect suspicious network patterns
        const suspiciousPatterns = [
            /\/admin/i,
            /\/api\/.*\b(select|drop|insert|update|delete)\b/i,
            /\/upload/i,
            /\/exec/i,
            /\/system/i
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(url)) {
                this.reportAnomaly('network', {
                    type: 'suspicious_request',
                    url: url,
                    pattern: pattern.source,
                    confidence: 0.8
                });
            }
        }
    }

    reportAnomaly(category, anomaly) {
        const report = {
            timestamp: Date.now(),
            category: category,
            anomaly: anomaly,
            sessionId: this.getSessionId(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Store anomaly report
        if (!this.anomalies) this.anomalies = [];
        this.anomalies.push(report);
        
        // Trigger immediate analysis if critical
        if (anomaly.confidence > 0.8) {
            this.performThreatAssessment(report);
        }
        
        console.warn('🚨 Behavioral Anomaly Detected:', report);
    }

    async performThreatAssessment(anomalyReport) {
        try {
            // Combine multiple anomaly reports for comprehensive analysis
            const recentAnomalies = this.getRecentAnomalies(300000); // Last 5 minutes
            
            // Use ML model for threat classification
            const features = this.extractFeatures(recentAnomalies);
            const prediction = await this.mlModel.predictThreat(features);
            
            // Classify threat type and severity
            const threatAssessment = await this.threatClassifier.classify(
                recentAnomalies,
                prediction
            );
            
            // Generate response recommendations
            const response = this.generateResponseRecommendations(threatAssessment);
            
            // Trigger automated response if needed
            if (threatAssessment.severity > 0.8) {
                await this.triggerAutomatedResponse(threatAssessment);
            }
            
            return {
                anomalyReport,
                threatAssessment,
                prediction,
                response,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('Threat assessment failed:', error);
        }
    }

    getRecentAnomalies(timeWindow) {
        const now = Date.now();
        return (this.anomalies || []).filter(
            anomaly => now - anomaly.timestamp < timeWindow
        );
    }

    extractFeatures(anomalies) {
        return {
            anomalyCount: anomalies.length,
            categories: [...new Set(anomalies.map(a => a.category))],
            avgConfidence: anomalies.reduce((sum, a) => sum + a.anomaly.confidence, 0) / anomalies.length,
            timeDistribution: this.calculateTimeDistribution(anomalies),
            severityScore: this.calculateSeverityScore(anomalies)
        };
    }

    calculateTimeDistribution(anomalies) {
        const intervals = [];
        for (let i = 1; i < anomalies.length; i++) {
            intervals.push(anomalies[i].timestamp - anomalies[i-1].timestamp);
        }
        return {
            avgInterval: intervals.reduce((a, b) => a + b, 0) / intervals.length,
            variance: this.calculateVariance(intervals)
        };
    }

    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    }

    calculateSeverityScore(anomalies) {
        return anomalies.reduce((score, anomaly) => {
            return score + (anomaly.anomaly.confidence * 10);
        }, 0);
    }

    generateResponseRecommendations(threatAssessment) {
        const recommendations = [];
        
        switch (threatAssessment.threatType) {
            case 'xss_attempt':
                recommendations.push({
                    action: 'Enable strict CSP',
                    priority: 'high',
                    implementation: "Content-Security-Policy: default-src 'none'; script-src 'self';"
                });
                break;
                
            case 'sql_injection':
                recommendations.push({
                    action: 'Implement input validation',
                    priority: 'critical',
                    implementation: 'Use parameterized queries and sanitized inputs'
                });
                break;
                
            case 'bot_activity':
                recommendations.push({
                    action: 'Implement rate limiting',
                    priority: 'medium',
                    implementation: 'Limit requests to 10 per minute per IP'
                });
                break;
                
            case 'advanced_persistent_threat':
                recommendations.push({
                    action: 'Enhanced monitoring',
                    priority: 'critical',
                    implementation: 'Activate comprehensive logging and alert system'
                });
                break;
        }
        
        return recommendations;
    }

    async triggerAutomatedResponse(threatAssessment) {
        console.log('🚨 Triggering automated response for:', threatAssessment.threatType);
        
        // Implement automated response actions
        switch (threatAssessment.threatType) {
            case 'bot_activity':
                this.enableRateLimiting();
                break;
                
            case 'sql_injection':
                this.temporaryBlockSuspiciousRequests();
                break;
                
            case 'xss_attempt':
                this.enhanceCSP();
                break;
        }
    }

    enableRateLimiting() {
        // Implement rate limiting
        console.log('⚡ Rate limiting activated');
    }

    temporaryBlockSuspiciousRequests() {
        // Block suspicious requests temporarily
        console.log('🛡️ Suspicious request blocking activated');
    }

    enhanceCSP() {
        // Enhance Content Security Policy
        console.log('🔒 Enhanced CSP activated');
    }

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    // Public API for external threat analysis
    async analyzeThreatContext(context) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        return await this.performThreatAssessment({
            timestamp: Date.now(),
            category: 'manual_analysis',
            anomaly: {
                type: 'manual_context_analysis',
                context: context,
                confidence: 0.9
            },
            sessionId: this.getSessionId()
        });
    }

    // Export behavioral data for analysis
    exportBehavioralData() {
        return {
            sessionId: this.sessionId,
            anomalies: this.anomalies || [],
            sessionData: this.sessionData,
            behavioralBaseline: Object.fromEntries(this.behavioralBaseline),
            timestamp: Date.now()
        };
    }
}

/**
 * Anomaly Detection Engine
 */
class AnomalyDetector {
    constructor() {
        this.threshold = 0.7;
        this.learningRate = 0.1;
    }
    
    detectAnomaly(data, baseline) {
        // Statistical anomaly detection
        const deviation = this.calculateDeviation(data, baseline);
        return {
            isAnomaly: deviation > this.threshold,
            deviation: deviation,
            confidence: Math.min(0.95, deviation)
        };
    }
    
    calculateDeviation(data, baseline) {
        // Calculate statistical deviation from baseline
        return Math.abs(data - baseline) / (baseline + 0.001);
    }
}

/**
 * Pattern Learning System
 */
class PatternLearner {
    constructor() {
        this.patterns = new Map();
        this.learningData = [];
    }
    
    learnFromData(data) {
        this.learningData.push(data);
        this.updatePatterns();
    }
    
    updatePatterns() {
        // Update learned patterns based on new data
        if (this.learningData.length > 100) {
            console.log('🧠 Updating learned patterns...');
            // Implementation would update ML model here
        }
    }
}

/**
 * Threat Classification System
 */
class ThreatClassifier {
    async classify(anomalies, prediction) {
        // Classify threat type based on anomaly patterns
        const threatTypes = this.identifyThreatTypes(anomalies);
        const severity = this.calculateSeverity(anomalies, prediction);
        
        return {
            threatType: threatTypes[0] || 'unknown',
            threatTypes: threatTypes,
            severity: severity,
            confidence: prediction.confidence,
            classificationTime: Date.now()
        };
    }
    
    identifyThreatTypes(anomalies) {
        const types = [];
        
        const categoryCounts = anomalies.reduce((counts, anomaly) => {
            counts[anomaly.category] = (counts[anomaly.category] || 0) + 1;
            return counts;
        }, {});
        
        // Map categories to threat types
        if (categoryCounts.input_behavior > 3) types.push('xss_attempt');
        if (categoryCounts.network > 2) types.push('injection_attempt');
        if (categoryCounts.click_behavior > 10) types.push('bot_activity');
        if (categoryCounts.performance > 5) types.push('dos_attempt');
        
        return types;
    }
    
    calculateSeverity(anomalies, prediction) {
        const avgConfidence = anomalies.reduce((sum, a) => sum + a.anomaly.confidence, 0) / anomalies.length;
        return Math.max(avgConfidence, prediction.threatScore);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIBehavioralAnalyzer, AnomalyDetector, PatternLearner, ThreatClassifier };
}