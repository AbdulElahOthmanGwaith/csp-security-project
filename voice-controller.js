/**
 * 🎤 Voice Controller - تحكم صوتي
 * نظام متقدم للتحكم الصوتي باللغة العربية في مركز القيادة الغامر
 * 
 * المميزات:
     * - تحكم صوتي باللغة العربية
     * - أوامر أمنية متخصصة
     * - استجابة صوتية ذكية
     * - تعلم أوامر مخصصة
     * - كشف اللهجات المختلفة
     * - ضوضاء متحكم فيها
 * 
 * @author MiniMax Agent
 * @version 2025.12.10
 */

class VoiceController {
    constructor() {
        this.isInitialized = false;
        this.isActive = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voice = null;
        this.commands = new Map();
        this.commandHistory = [];
        this.learningMode = false;
        
        // إعدادات الصوت
        this.config = {
            language: 'ar-SA', // العربية السعودية
            continuous: true,
            interimResults: false,
            maxAlternatives: 3,
            confidenceThreshold: 0.7,
            autoStart: false,
            voiceSpeed: 0.9,
            voicePitch: 1.0,
            voiceVolume: 0.8,
            enableLearning: true,
            enableFeedback: true,
            enableCommands: true
        };
        
        // بيانات التعلم
        this.learningData = {
            recognizedCommands: new Map(),
            userPatterns: new Map(),
            successRate: 0,
            totalAttempts: 0,
            successfulCommands: 0
        };
        
        // أوامر صوتية محددة
        this.setupCommands();
        
        // معالجة الضوضاء
        this.noiseFilter = {
            enabled: true,
            threshold: 0.1,
            lastCommand: null,
            commandDelay: 2000 // 2 ثانية بين الأوامر
        };
        
        console.log('🎤 تم تهيئة Voice Controller');
    }
    
    /**
     * تهيئة النظام
     */
    async initialize() {
        try {
            console.log('🔧 بدء تهيئة التحكم الصوتي...');
            
            // فحص دعم Web Speech API
            if (!this.isSpeechRecognitionSupported()) {
                throw new Error('Web Speech API غير مدعوم');
            }
            
            // فحص دعم Text-to-Speech
            if (!this.isSpeechSynthesisSupported()) {
                throw new Error('Text-to-Speech غير مدعوم');
            }
            
            // تهيئة التعرف على الصوت
            await this.initializeSpeechRecognition();
            
            // تهيئة التحدث
            await this.initializeSpeechSynthesis();
            
            // تحميل الأصوات المتاحة
            await this.loadAvailableVoices();
            
            // بدء معالجة الضوضاء
            this.initializeNoiseFilter();
            
            this.isInitialized = true;
            
            console.log('✅ تم تهيئة التحكم الصوتي بنجاح');
            
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة التحكم الصوتي:', error);
            throw error;
        }
    }
    
    /**
     * فحص دعم التعرف على الصوت
     */
    isSpeechRecognitionSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }
    
    /**
     * فحص دعم التحدث
     */
    isSpeechSynthesisSupported() {
        return 'speechSynthesis' in window;
    }
    
    /**
     * تهيئة التعرف على الصوت
     */
    async initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // إعدادات التعرف
        this.recognition.lang = this.config.language;
        this.recognition.continuous = this.config.continuous;
        this.recognition.interimResults = this.config.interimResults;
        this.recognition.maxAlternatives = this.config.maxAlternatives;
        
        // ربط الأحداث
        this.bindRecognitionEvents();
        
        console.log('🎙️ تم تهيئة التعرف على الصوت');
    }
    
    /**
     * تهيئة التحدث
     */
    async initializeSpeechSynthesis() {
        console.log('🔊 تم تهيئة التحدث الصوتي');
    }
    
    /**
     * تحميل الأصوات المتاحة
     */
    async loadAvailableVoices() {
        return new Promise((resolve) => {
            const loadVoices = () => {
                const voices = this.synthesis.getVoices();
                
                // البحث عن صوت عربي
                const arabicVoice = voices.find(voice => 
                    voice.lang.startsWith('ar') || 
                    voice.name.includes('Arabic') ||
                    voice.name.includes('عربي')
                );
                
                if (arabicVoice) {
                    this.voice = arabicVoice;
                    console.log('🔊 تم تحميل الصوت العربي:', arabicVoice.name);
                } else {
                    // استخدام صوت افتراضي
                    this.voice = voices[0];
                    console.log('🔊 تم تحميل الصوت الافتراضي:', this.voice?.name || 'غير محدد');
                }
                
                resolve(voices);
            };
            
            if (this.synthesis.getVoices().length > 0) {
                loadVoices();
            } else {
                this.synthesis.onvoiceschanged = loadVoices;
            }
        });
    }
    
    /**
     * ربط أحداث التعرف على الصوت
     */
    bindRecognitionEvents() {
        this.recognition.onstart = () => {
            console.log('🎤 بدء الاستماع');
            this.isActive = true;
            this.emit('listening_started');
        };
        
        this.recognition.onend = () => {
            console.log('🛑 توقف الاستماع');
            this.isActive = false;
            this.emit('listening_stopped');
            
            // إعادة التشغيل إذا كان مستمر
            if (this.config.continuous && this.isActive) {
                setTimeout(() => {
                    this.recognition.start();
                }, 100);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.warn('⚠️ خطأ في التعرف على الصوت:', event.error);
            this.emit('recognition_error', event);
            
            // معالجة أخطاء معينة
            switch (event.error) {
                case 'no-speech':
                    // إعادة المحاولة بعد فترة
                    break;
                case 'audio-capture':
                    this.emit('microphone_error', event);
                    break;
                case 'not-allowed':
                    this.emit('permission_denied', event);
                    break;
                case 'network':
                    this.emit('network_error', event);
                    break;
            }
        };
        
        this.recognition.onresult = (event) => {
            this.handleRecognitionResult(event);
        };
        
        this.recognition.onnomatch = () => {
            console.log('❓ لم يتم التعرف على الكلام');
            this.emit('no_match');
        };
    }
    
    /**
     * معالجة نتيجة التعرف
     */
    handleRecognitionResult(event) {
        const results = event.results;
        const result = results[results.length - 1];
        const transcript = result[0].transcript.trim();
        const confidence = result[0].confidence;
        
        console.log('🗣️ تم التعرف على الكلام:', transcript, `(الثقة: ${Math.round(confidence * 100)}%)`);
        
        // فحص الضوضاء
        if (this.shouldFilterNoise(transcript)) {
            console.log('🔇 تم تصفية ضوضاء');
            return;
        }
        
        // حفظ في التاريخ
        this.commandHistory.push({
            transcript: transcript,
            confidence: confidence,
            timestamp: new Date(),
            recognized: false
        });
        
        // التعرف على الأمر
        this.recognizeCommand(transcript, confidence);
    }
    
    /**
     * فحص تصفية الضوضاء
     */
    shouldFilterNoise(transcript) {
        if (!this.noiseFilter.enabled) return false;
        
        const now = Date.now();
        const lastCommand = this.noiseFilter.lastCommand;
        
        // فحص التأخير بين الأوامر
        if (lastCommand && (now - lastCommand.timestamp) < this.noiseFilter.commandDelay) {
            return true;
        }
        
        // فحص القصير جداً
        if (transcript.length < 3) {
            return true;
        }
        
        // فحص الكلمات غير المهمة
        const noiseWords = ['ام', 'أه', 'إه', 'أها', 'هو', 'هي'];
        if (noiseWords.includes(transcript.toLowerCase())) {
            return true;
        }
        
        return false;
    }
    
    /**
     * التعرف على الأمر
     */
    recognizeCommand(transcript, confidence) {
        // تحديث بيانات التعلم
        this.learningData.totalAttempts++;
        
        // البحث عن أمر مطابق
        let bestMatch = null;
        let bestScore = 0;
        
        this.commands.forEach((commandData, commandId) => {
            const score = this.calculateCommandSimilarity(transcript, commandData);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = { id: commandId, data: commandData, score: score };
            }
        });
        
        // فحص العتبة
        if (bestMatch && bestScore >= this.config.confidenceThreshold) {
            this.executeCommand(bestMatch, transcript, confidence);
        } else {
            // في وضع التعلم، احفظ الأمر الجديد
            if (this.learningMode) {
                this.learnNewCommand(transcript, confidence);
            } else {
                this.handleUnknownCommand(transcript, confidence);
            }
        }
    }
    
    /**
     * حساب التشابه مع الأمر
     */
    calculateCommandSimilarity(transcript, commandData) {
        const transcriptLower = transcript.toLowerCase();
        
        // فحص المطابقة المباشرة
        for (const phrase of commandData.phrases) {
            if (transcriptLower.includes(phrase.toLowerCase())) {
                return 1.0;
            }
        }
        
        // فحص الكلمات المفتاحية
        let keywordMatches = 0;
        for (const keyword of commandData.keywords) {
            if (transcriptLower.includes(keyword.toLowerCase())) {
                keywordMatches++;
            }
        }
        
        const keywordScore = commandData.keywords.length > 0 ? 
            keywordMatches / commandData.keywords.length : 0;
        
        // فحص التشابه الصوتي (مبسط)
        const fuzzyScore = this.calculateFuzzySimilarity(transcriptLower, commandData.phrases);
        
        return Math.max(keywordScore, fuzzyScore);
    }
    
    /**
     * حساب التشابه الضبابي
     */
    calculateFuzzySimilarity(text, phrases) {
        let maxSimilarity = 0;
        
        for (const phrase of phrases) {
            const similarity = this.levenshteinDistance(text, phrase.toLowerCase());
            const maxLen = Math.max(text.length, phrase.length);
            const similarityScore = 1 - (similarity / maxLen);
            maxSimilarity = Math.max(maxSimilarity, similarityScore);
        }
        
        return maxSimilarity;
    }
    
    /**
     * حساب مسافة Levenshtein
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    /**
     * تنفيذ الأمر
     */
    executeCommand(match, transcript, confidence) {
        console.log('⚡ تنفيذ أمر:', match.id);
        
        // تحديث إحصائيات التعلم
        this.learningData.successfulCommands++;
        this.learningData.successRate = 
            this.learningData.successfulCommands / this.learningData.totalAttempts;
        
        // حفظ الأمر المنفذ
        const commandRecord = {
            commandId: match.id,
            transcript: transcript,
            confidence: confidence,
            score: match.score,
            timestamp: new Date(),
            executed: true
        };
        
        this.commandHistory[this.commandHistory.length - 1].recognized = true;
        this.commandHistory[this.commandHistory.length - 1].commandId = match.id;
        
        // تسجيل في بيانات التعلم
        this.learningData.recognizedCommands.set(match.id, 
            (this.learningData.recognizedCommands.get(match.id) || 0) + 1);
        
        // تنفيذ الأمر
        try {
            match.data.callback(transcript, confidence, match.score);
            this.emit('command_executed', commandRecord);
            
            // رد صوتي
            if (this.config.enableFeedback) {
                this.speak(match.data.response || 'تم تنفيذ الأمر');
            }
            
        } catch (error) {
            console.error('خطأ في تنفيذ الأمر:', error);
            this.emit('command_error', { command: match.id, error: error });
            
            this.speak('عذراً، حدث خطأ في تنفيذ الأمر');
        }
        
        // تحديث آخر أمر
        this.noiseFilter.lastCommand = {
            transcript: transcript,
            timestamp: Date.now()
        };
    }
    
    /**
     * معالجة أمر غير معروف
     */
    handleUnknownCommand(transcript, confidence) {
        console.log('❓ أمر غير معروف:', transcript);
        
        this.emit('unknown_command', {
            transcript: transcript,
            confidence: confidence,
            timestamp: new Date()
        });
        
        // اقتراح أوامر مشابهة
        const suggestions = this.getCommandSuggestions(transcript);
        
        if (suggestions.length > 0 && this.config.enableFeedback) {
            this.speak(`لم أفهم. هل تقصد ${suggestions.join(' أو ')}؟`);
        } else if (this.config.enableFeedback) {
            this.speak('عذراً، لم أفهم الأمر. يمكنك قول "مساعدة" لعرض الأوامر المتاحة');
        }
    }
    
    /**
     * تعلم أمر جديد
     */
    learnNewCommand(transcript, confidence) {
        console.log('📚 تعلم أمر جديد:', transcript);
        
        // حفظ الأمر للتعلم
        if (!this.learningData.userPatterns.has(transcript)) {
            this.learningData.userPatterns.set(transcript, {
                count: 1,
                confidence: confidence,
                firstSeen: new Date(),
                lastSeen: new Date()
            });
        } else {
            const pattern = this.learningData.userPatterns.get(transcript);
            pattern.count++;
            pattern.confidence = (pattern.confidence + confidence) / 2;
            pattern.lastSeen = new Date();
        }
        
        this.emit('learning_new_command', {
            transcript: transcript,
            confidence: confidence,
            timestamp: new Date()
        });
        
        if (this.config.enableFeedback) {
            this.speak('شكراً لك. سأتعلم هذا الأمر');
        }
    }
    
    /**
     * الحصول على اقتراحات أوامر
     */
    getCommandSuggestions(transcript) {
        const suggestions = [];
        
        this.commands.forEach((commandData, commandId) => {
            const similarity = this.calculateCommandSimilarity(transcript, commandData);
            if (similarity > 0.5) {
                suggestions.push(commandData.displayName);
            }
        });
        
        return suggestions.slice(0, 3); // أهم 3 اقتراحات
    }
    
    /**
     * إعداد الأوامر الصوتية
     */
    setupCommands() {
        // أوامر أساسية
        this.addCommand('help', {
            displayName: 'مساعدة',
            description: 'عرض قائمة الأوامر المتاحة',
            phrases: ['مساعدة', 'أوامر', 'ما يمكنني فعله', 'الأوامر'],
            keywords: ['مساعدة', 'أوامر'],
            response: 'إليك الأوامر المتاحة: تحليل التهديدات، حظر التهديد، عزل النظام، تقرير، حالة النظام، وضع الواقع الافتراضي',
            callback: () => {
                this.showAvailableCommands();
                this.emit('help_requested');
            }
        });
        
        // أوامر الأمان السيبراني
        this.addCommand('analyze_threats', {
            displayName: 'تحليل التهديدات',
            description: 'بدء تحليل شامل للتهديدات',
            phrases: ['حلل التهديدات', 'تحليل التهديدات', 'فحص التهديدات', 'تحقق من التهديدات'],
            keywords: ['تحليل', 'فحص', 'تهديدات'],
            response: 'بدء تحليل التهديدات الآن',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.runThreatAnalysis();
                }
                this.emit('threat_analysis_started');
            }
        });
        
        this.addCommand('block_threat', {
            displayName: 'حظر التهديد',
            description: 'حظر التهديد الحالي',
            phrases: ['حظر التهديد', 'منع التهديد', 'احجب التهديد'],
            keywords: ['حظر', 'منع', 'احجب'],
            response: 'تم حظر التهديد',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.blockCurrentThreat();
                }
                this.emit('threat_blocked');
            }
        });
        
        this.addCommand('isolate_system', {
            displayName: 'عزل النظام',
            description: 'عزل النظام المصاب',
            phrases: ['عزل النظام', 'عزل الشبكة', 'قطع الاتصال'],
            keywords: ['عزل', 'قطع', 'منع'],
            response: 'تم عزل النظام',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.isolateSystem();
                }
                this.emit('system_isolated');
            }
        });
        
        this.addCommand('generate_report', {
            displayName: 'تقرير',
            description: 'إنشاء تقرير أمني',
            phrases: ['أعطني تقرير', 'إنشاء تقرير', 'تقرير أمني', 'تصدير تقرير'],
            keywords: ['تقرير', 'تصدير', 'إنشاء'],
            response: 'جاري إنشاء التقرير',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.generateReport();
                }
                this.emit('report_generated');
            }
        });
        
        this.addCommand('system_status', {
            displayName: 'حالة النظام',
            description: 'عرض حالة النظام الحالية',
            phrases: ['حالة النظام', 'ما حالة النظام', 'عرض الحالة'],
            keywords: ['حالة', 'نظام', 'عرض'],
            response: 'عرض حالة النظام',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.showSystemStatus();
                }
                this.emit('system_status_requested');
            }
        });
        
        // أوامر الواقع الافتراضي
        this.addCommand('enter_vr', {
            displayName: 'وضع الواقع الافتراضي',
            description: 'الدخول إلى وضع الواقع الافتراضي',
            phrases: ['وضع الواقع الافتراضي', 'ادخل الواقع الافتراضي', 'فعّل VR'],
            keywords: ['واقع', 'افتراضي', 'VR'],
            response: 'تم الدخول إلى وضع الواقع الافتراضي',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.enterVRMode();
                }
                this.emit('vr_mode_activated');
            }
        });
        
        this.addCommand('exit_vr', {
            displayName: 'الخروج من VR',
            description: 'الخروج من وضع الواقع الافتراضي',
            phrases: ['اخرج من الواقع الافتراضي', 'توقف VR', 'اخرج من VR'],
            keywords: ['اخرج', 'توقف', 'VR'],
            response: 'تم الخروج من وضع الواقع الافتراضي',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.exitVRMode();
                }
                this.emit('vr_mode_deactivated');
            }
        });
        
        // أوامر التحكم
        this.addCommand('emergency_stop', {
            displayName: 'إيقاف طوارئ',
            description: 'إيقاف طوارئ فوري',
            phrases: ['إيقاف طوارئ', 'طوارئ', 'توقف فوري'],
            keywords: ['إيقاف', 'طوارئ', 'فوري'],
            response: 'تم تفعيل الإيقاف الطارئ',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.emergencyStop();
                }
                this.emit('emergency_stop_activated');
            }
        });
        
        this.addCommand('zoom_in', {
            displayName: 'تكبير',
            description: 'تكبير العرض',
            phrases: ['كبر', 'تكبير', 'اقترب'],
            keywords: ['كبر', 'تكبير', 'اقترب'],
            response: 'تم التكبير',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.zoomIn();
                }
                this.emit('zoom_in');
            }
        });
        
        this.addCommand('zoom_out', {
            displayName: 'تصغير',
            description: 'تصغير العرض',
            phrases: ['صغر', 'تصغير', 'ابتعد'],
            keywords: ['صغر', 'تصغير', 'ابتعد'],
            response: 'تم التصغير',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.zoomOut();
                }
                this.emit('zoom_out');
            }
        });
        
        this.addCommand('reset_view', {
            displayName: 'إعادة تعيين العرض',
            description: 'إعادة تعيين العرض للوضع الافتراضي',
            phrases: ['إعادة تعيين', 'ارجع للوضع الطبيعي', 'اعرض عادي'],
            keywords: ['إعادة', 'تعيين', 'طبيعي'],
            response: 'تم إعادة تعيين العرض',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.resetView();
                }
                this.emit('view_reset');
            }
        });
        
        // أوامر التدريب
        this.addCommand('start_training', {
            displayName: 'بدء التدريب',
            description: 'بدء جلسة تدريب أمنية',
            phrases: ['ابدأ التدريب', 'تدريب', 'جلسة تدريب'],
            keywords: ['تدريب', 'ابدأ', 'جلسة'],
            response: 'بدء جلسة التدريب الأمني',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.startTraining();
                }
                this.emit('training_started');
            }
        });
        
        this.addCommand('vr_training', {
            displayName: 'تدريب VR',
            description: 'بدء تدريب الواقع الافتراضي',
            phrases: ['تدريب الواقع الافتراضي', 'تدريب VR'],
            keywords: ['تدريب', 'VR', 'واقع'],
            response: 'بدء تدريب الواقع الافتراضي',
            callback: () => {
                if (window.holographicCommand) {
                    window.holographicCommand.startVRTraining();
                }
                this.emit('vr_training_started');
            }
        });
        
        console.log('📝 تم إعداد', this.commands.size, 'أمر صوتي');
    }
    
    /**
     * إضافة أمر جديد
     */
    addCommand(id, commandData) {
        this.commands.set(id, {
            id: id,
            displayName: commandData.displayName,
            description: commandData.description,
            phrases: commandData.phrases || [],
            keywords: commandData.keywords || [],
            response: commandData.response || 'تم تنفيذ الأمر',
            callback: commandData.callback
        });
    }
    
    /**
     * بدء الاستماع
     */
    startListening() {
        if (!this.isInitialized) {
            throw new Error('Voice Controller غير مهيأ');
        }
        
        if (this.isActive) {
            console.log('🎤 الاستماع نشط بالفعل');
            return;
        }
        
        try {
            this.recognition.start();
            console.log('🎤 بدء الاستماع للأوامر الصوتية');
            
        } catch (error) {
            console.error('خطأ في بدء الاستماع:', error);
            this.emit('start_listening_error', error);
        }
    }
    
    /**
     * إيقاف الاستماع
     */
    stopListening() {
        if (!this.isActive) {
            console.log('🎤 الاستماع متوقف بالفعل');
            return;
        }
        
        try {
            this.recognition.stop();
            this.isActive = false;
            console.log('🛑 توقف الاستماع');
            
        } catch (error) {
            console.error('خطأ في إيقاف الاستماع:', error);
        }
    }
    
    /**
     * التحدث
     */
    speak(text, options = {}) {
        if (!this.synthesis || !this.config.enableFeedback) {
            return;
        }
        
        // إيقاف أي كلام سابق
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // إعدادات الصوت
        utterance.voice = this.voice;
        utterance.rate = options.rate || this.config.voiceSpeed;
        utterance.pitch = options.pitch || this.config.voicePitch;
        utterance.volume = options.volume || this.config.voiceVolume;
        
        // أحداث الكلام
        utterance.onstart = () => {
            console.log('🔊 بدء الكلام:', text);
        };
        
        utterance.onend = () => {
            console.log('✅ انتهاء الكلام');
        };
        
        utterance.onerror = (event) => {
            console.warn('⚠️ خطأ في الكلام:', event.error);
        };
        
        this.synthesis.speak(utterance);
    }
    
    /**
     * عرض الأوامر المتاحة
     */
    showAvailableCommands() {
        const commandList = [];
        this.commands.forEach((command, id) => {
            commandList.push(`${command.displayName}: ${command.description}`);
        });
        
        const message = `الأوامر المتاحة هي: ${commandList.join(', ')}`;
        console.log('📋 الأوامر المتاحة:', commandList);
        
        if (this.config.enableFeedback) {
            this.speak(message);
        }
        
        this.emit('commands_listed', commandList);
    }
    
    /**
     * تهيئة تصفية الضوضاء
     */
    initializeNoiseFilter() {
        console.log('🔇 تم تفعيل تصفية الضوضاء');
    }
    
    /**
     * الحصول على حالة النظام
     */
    getSystemState() {
        return {
            isInitialized: this.isInitialized,
            isActive: this.isActive,
            isLearning: this.learningMode,
            totalCommands: this.commands.size,
            commandHistory: this.commandHistory.slice(-10),
            learningData: {
                successRate: this.learningData.successRate,
                totalAttempts: this.learningData.totalAttempts,
                successfulCommands: this.learningData.successfulCommands,
                learnedCommands: this.learningData.userPatterns.size
            },
            config: this.config
        };
    }
    
    /**
     * تحديث الإعدادات
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // تحديث إعدادات التعرف على الصوت
        if (this.recognition) {
            this.recognition.lang = this.config.language;
            this.recognition.continuous = this.config.continuous;
            this.recognition.interimResults = this.config.interimResults;
        }
        
        console.log('🔧 تم تحديث إعدادات التحكم الصوتي:', this.config);
    }
    
    /**
     * تفعيل وضع التعلم
     */
    enableLearningMode() {
        this.learningMode = true;
        console.log('📚 تم تفعيل وضع التعلم');
        this.speak('تم تفعيل وضع التعلم، سأتعلم أوامر جديدة');
        this.emit('learning_mode_enabled');
    }
    
    /**
     * إيقاف وضع التعلم
     */
    disableLearningMode() {
        this.learningMode = false;
        console.log('📚 تم إيقاف وضع التعلم');
        this.speak('تم إيقاف وضع التعلم');
        this.emit('learning_mode_disabled');
    }
    
    /**
     * الحصول على إحصائيات التعلم
     */
    getLearningStats() {
        return {
            successRate: this.learningData.successRate,
            totalAttempts: this.learningData.totalAttempts,
            successfulCommands: this.learningData.successfulCommands,
            recognizedCommands: Object.fromEntries(this.learningData.recognizedCommands),
            userPatterns: Object.fromEntries(this.learningData.userPatterns)
        };
    }
    
    /**
     * تصدير الأوامر المخصصة
     */
    exportCustomCommands() {
        const customCommands = {};
        this.learningData.userPatterns.forEach((pattern, transcript) => {
            customCommands[transcript] = {
                count: pattern.count,
                confidence: pattern.confidence,
                firstSeen: pattern.firstSeen,
                lastSeen: pattern.lastSeen
            };
        });
        
        return {
            customCommands: customCommands,
            learningStats: this.getLearningStats(),
            exportedAt: new Date()
        };
    }
    
    /**
     * استيراد الأوامر المخصصة
     */
    importCustomCommands(data) {
        if (data.customCommands) {
            Object.entries(data.customCommands).forEach(([transcript, pattern]) => {
                this.learningData.userPatterns.set(transcript, pattern);
            });
        }
        
        console.log('📥 تم استيراد الأوامر المخصصة');
    }
    
    /**
     * نظام الأحداث
     */
    emit(eventName, data) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('خطأ في مستمع الحدث:', error);
                }
            });
        }
    }
    
    on(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }
    
    off(eventName, callback) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName] = this.eventListeners[eventName].filter(cb => cb !== callback);
        }
    }
    
    /**
     * تدمير النظام
     */
    destroy() {
        console.log('🗑️ تدمير Voice Controller...');
        
        this.stopListening();
        this.synthesis.cancel();
        
        if (this.recognition) {
            this.recognition.onstart = null;
            this.recognition.onend = null;
            this.recognition.onerror = null;
            this.recognition.onresult = null;
        }
        
        this.commands.clear();
        this.commandHistory = [];
        this.learningData.recognizedCommands.clear();
        this.learningData.userPatterns.clear();
        
        console.log('✅ تم تدمير Voice Controller');
    }
}

// تصدير للاستخدام في الوحدات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceController;
}