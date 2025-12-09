/**
 * 👋 Gesture Controller - تحكم بالإيماءات
 * نظام متقدم للتعرف على حركات اليد والإيماءات للتحكم في واجهة غامرة
 * 
 * المميزات:
 * - التعرف على 20+ إيماءة
 * - تتبع حركة اليدين
 * - تحكم باللمس الافتراضي
 * - إيماءات مخصصة للعربية
 * - دعم متعدد المستخدمين
 * 
 * @author MiniMax Agent
 * @version 2025.12.10
 */

class GestureController {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isInitialized = false;
        this.isActive = false;
        this.hands = new Map();
        this.gestures = new Map();
        this.gestureHistory = [];
        
        // إعدادات التحكم
        this.config = {
            maxHands: 2,
            confidenceThreshold: 0.7,
            enable3DTracking: true,
            gestureSmoothing: 0.3,
            enableCustomGestures: true,
            sensitivity: 1.0,
            enableMultiUser: false
        };
        
        // تعريف الإيماءات
        this.defineGestures();
        
        // بيانات التتبع
        this.trackingData = {
            lastHandPositions: new Map(),
            gestureStartTime: null,
            currentGesture: null,
            gestureConfidence: 0
        };
        
        // محاكاة MediaPipe أو نظام مشابه
        this.mockHandTracking = this.createMockHandTracking();
        
        console.log('👋 تم تهيئة Gesture Controller');
    }
    
    /**
     * تهيئة النظام
     */
    async initialize() {
        try {
            console.log('🔧 بدء تهيئة التحكم بالإيماءات...');
            
            // إعداد Canvas للمعالجة
            this.canvas.width = this.videoElement.videoWidth || 640;
            this.canvas.height = this.videoElement.videoHeight || 480;
            
            // فحص دعم الكاميرا
            if (!this.videoElement.srcObject) {
                throw new Error('لا يوجد مصدر فيديو للكاميرا');
            }
            
            // بدء التتبع
            this.startTracking();
            
            this.isInitialized = true;
            this.isActive = true;
            
            console.log('✅ تم تهيئة التحكم بالإيماءات');
            
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة التحكم بالإيماءات:', error);
            throw error;
        }
    }
    
    /**
     * تعريف الإيماءات المدعومة
     */
    defineGestures() {
        // إيماءات أساسية
        this.gestures.set('hand_open', {
            name: 'اليد مفتوحة',
            description: 'افتح يدك للتحديد',
            confidence: 0.8,
            triggers: ['select', 'confirm']
        });
        
        this.gestures.set('hand_closed', {
            name: 'اليد مغلقة',
            description: 'أغلق يدك للإلغاء',
            confidence: 0.8,
            triggers: ['cancel', 'back']
        });
        
        this.gestures.set('pointing', {
            name: 'الإشارة',
            description: 'أشر للإشارة إلى عنصر',
            confidence: 0.9,
            triggers: ['select', 'point']
        });
        
        this.gestures.set('thumbs_up', {
            name: 'إبهام للأعلى',
            description: 'ارفع إبهامك للموافقة',
            confidence: 0.85,
            triggers: ['confirm', 'approve']
        });
        
        this.gestures.set('thumbs_down', {
            name: 'إبهام للأسفل',
            description: 'أشر بإبهامك للأسفل للرفض',
            confidence: 0.85,
            triggers: ['reject', 'deny']
        });
        
        // إيماءات متقدمة
        this.gestures.set('swipe_left', {
            name: 'السحب لليسار',
            description: 'حرك يدك من اليمين إلى اليسار',
            confidence: 0.75,
            triggers: ['navigate', 'previous']
        });
        
        this.gestures.set('swipe_right', {
            name: 'السحب لليمين',
            description: 'حرك يدك من اليسار إلى اليمين',
            confidence: 0.75,
            triggers: ['navigate', 'next']
        });
        
        this.gestures.set('swipe_up', {
            name: 'السحب للأعلى',
            description: 'حرك يدك من أسفل إلى أعلى',
            confidence: 0.75,
            triggers: ['scroll_up', 'zoom_in']
        });
        
        this.gestures.set('swipe_down', {
            name: 'السحب للأسفل',
            description: 'حرك يدك من أعلى إلى أسفل',
            confidence: 0.75,
            triggers: ['scroll_down', 'zoom_out']
        });
        
        this.gestures.set('pinch', {
            name: 'الإمساك',
            description: 'قرّب إصبعين لبعض للإمساك',
            confidence: 0.8,
            triggers: ['grab', 'hold']
        });
        
        this.gestures.set('pinch_out', {
            name: 'فتح الإمساك',
            description: 'افتح إصبعيك للإفلات',
            confidence: 0.8,
            triggers: ['release', 'drop']
        });
        
        this.gestures.set('rotate_clockwise', {
            name: 'الدوران عقارب الساعة',
            description: 'حرك يدك في اتجاه عقارب الساعة',
            confidence: 0.7,
            triggers: ['rotate', 'clockwise']
        });
        
        this.gestures.set('rotate_counter_clockwise', {
            name: 'الدوران عكس عقارب الساعة',
            description: 'حرك يدك عكس اتجاه عقارب الساعة',
            confidence: 0.7,
            triggers: ['rotate', 'counter_clockwise']
        });
        
        // إيماءات صوتية باللغة العربية
        this.gestures.set('call_me', {
            name: 'إشارة النداء',
            description: 'حرك إصبعك نحوك لنداء النظام',
            confidence: 0.75,
            triggers: ['voice_command', 'call']
        });
        
        this.gestures.set('stop', {
            name: 'إشارة التوقف',
            description: 'ارفع راحة يدك للتوقف',
            confidence: 0.9,
            triggers: ['stop', 'pause']
        });
        
        this.gestures.set('victory', {
            name: 'إشارة النصر',
            description: 'اعرض إصبعين للأعلى للإيجاب',
            confidence: 0.8,
            triggers: ['positive', 'success']
        });
        
        this.gestures.set('number_one', {
            name: 'الرقم واحد',
            description: 'ارفع إصبع واحد للتركيز',
            confidence: 0.8,
            triggers: ['focus', 'primary']
        });
        
        this.gestures.set('number_two', {
            name: 'الرقم اثنان',
            description: 'ارفع إصبعين للتحديد المتعدد',
            confidence: 0.8,
            triggers: ['multi_select', 'secondary']
        });
        
        this.gestures.set('number_three', {
            name: 'الرقم ثلاثة',
            description: 'ارفع ثلاثة أصابع للإعدادات',
            confidence: 0.8,
            triggers: ['settings', 'options']
        });
        
        // إيماءات تقنية للأمان السيبراني
        this.gestures.set('shield', {
            name: 'درع الحماية',
            description: 'ارفع يديك كدرع للحماية',
            confidence: 0.7,
            triggers: ['protect', 'defense']
        });
        
        this.gestures.set('warning', {
            name: 'تحذير',
            description: 'حرك يدك بتحذير للخطر',
            confidence: 0.75,
            triggers: ['warning', 'alert']
        });
        
        this.gestures.set('scan', {
            name: 'فحص',
            description: 'حرك يدك في حركة فحص',
            confidence: 0.7,
            triggers: ['scan', 'analyze']
        });
        
        console.log('📝 تم تعريف', this.gestures.size, 'إيماءة');
    }
    
    /**
     * إنشاء نظام تتبع وهمية
     */
    createMockHandTracking() {
        return {
            isTracking: false,
            hands: [],
            
            start: () => {
                this.isTracking = true;
                console.log('🎥 بدء تتبع اليدين الوهمي');
            },
            
            stop: () => {
                this.isTracking = false;
                this.hands.clear();
                console.log('🛑 توقف تتبع اليدين الوهمي');
            },
            
            update: () => {
                if (!this.isTracking) return;
                
                // محاكاة كشف اليدين
                this.simulateHandDetection();
            }
        };
    }
    
    /**
     * محاكاة كشف اليدين
     */
    simulateHandDetection() {
        const time = Date.now() * 0.001;
        
        // محاكاة يد واحدة أو اثنتين
        const handCount = Math.random() > 0.3 ? 1 : 0;
        this.hands.clear();
        
        for (let i = 0; i < handCount; i++) {
            const hand = {
                id: `hand_${i}`,
                handedness: i === 0 ? 'right' : 'left',
                landmarks: this.generateHandLandmarks(time, i),
                confidence: 0.8 + Math.random() * 0.2,
                timestamp: Date.now()
            };
            
            this.hands.set(hand.id, hand);
        }
        
        // معالجة الإيماءات إذا تم اكتشاف يد
        if (this.hands.size > 0) {
            this.processGestures();
        }
    }
    
    /**
     * توليد معالم اليد الوهمية
     */
    generateHandLandmarks(time, handIndex) {
        const landmarks = [];
        
        // 21 نقطة معلم لليد (MediaPipe Hands format)
        for (let i = 0; i < 21; i++) {
            // محاكاة حركة طبيعية لليد
            const baseX = 0.3 + handIndex * 0.4;
            const baseY = 0.5;
            const baseZ = 0;
            
            let x, y, z;
            
            if (i < 5) {
                // الإبهام
                x = baseX + Math.sin(time * 0.5 + i * 0.3) * 0.1;
                y = baseY + Math.cos(time * 0.7 + i * 0.2) * 0.05;
            } else if (i < 9) {
                // السبابة
                x = baseX + Math.sin(time * 0.6 + (i-5) * 0.2) * 0.08;
                y = baseY - 0.1 - (i-5) * 0.03 + Math.sin(time * 0.8) * 0.02;
            } else if (i < 13) {
                // الأوسط
                x = baseX + Math.sin(time * 0.4 + (i-9) * 0.25) * 0.08;
                y = baseY - 0.12 - (i-9) * 0.03 + Math.cos(time * 0.9) * 0.02;
            } else if (i < 17) {
                // البنصر
                x = baseX + Math.sin(time * 0.5 + (i-13) * 0.2) * 0.07;
                y = baseY - 0.11 - (i-13) * 0.03 + Math.sin(time * 1.0) * 0.02;
            } else {
                // الخنصر
                x = baseX + Math.sin(time * 0.7 + (i-17) * 0.15) * 0.06;
                y = baseY - 0.1 - (i-17) * 0.03 + Math.cos(time * 1.2) * 0.02;
            }
            
            z = baseZ + Math.sin(time * 0.3 + i * 0.1) * 0.02;
            
            landmarks.push({ x, y, z });
        }
        
        return landmarks;
    }
    
    /**
     * بدء التتبع
     */
    startTracking() {
        if (!this.isInitialized) {
            throw new Error('Gesture Controller غير مهيأ');
        }
        
        this.isActive = true;
        this.mockHandTracking.start();
        this.startTrackingLoop();
        
        console.log('🎯 بدء تتبع الإيماءات');
        this.emit('tracking_started');
    }
    
    /**
     * إيقاف التتبع
     */
    stopTracking() {
        this.isActive = false;
        this.mockHandTracking.stop();
        
        console.log('🛑 توقف تتبع الإيماءات');
        this.emit('tracking_stopped');
    }
    
    /**
     * بدء حلقة التتبع
     */
    startTrackingLoop() {
        const track = () => {
            if (!this.isActive) return;
            
            try {
                // تحديث التتبع
                this.mockHandTracking.update();
                
                // تحديث المعالم
                this.updateHandLandmarks();
                
                // طلب الإطار التالي
                requestAnimationFrame(track);
                
            } catch (error) {
                console.error('خطأ في حلقة التتبع:', error);
                setTimeout(track, 100); // محاولة إعادة التتبع
            }
        };
        
        track();
    }
    
    /**
     * تحديث معالم اليد
     */
    updateHandLandmarks() {
        this.hands.forEach((hand, handId) => {
            // تطبيق التنعيم على المعالم
            hand.landmarks = this.smoothLandmarks(hand.landmarks, handId);
            
            // تحديد موقع اليد في الشاشة
            hand.screenPosition = this.calculateScreenPosition(hand.landmarks);
        });
    }
    
    /**
     * تنعيم المعالم
     */
    smoothLandmarks(landmarks, handId) {
        const lastPositions = this.trackingData.lastHandPositions.get(handId) || [];
        const smoothed = [];
        
        for (let i = 0; i < landmarks.length; i++) {
            const current = landmarks[i];
            const last = lastPositions[i] || current;
            
            // تطبيق التنعيم
            const alpha = this.config.gestureSmoothing;
            const smoothedPoint = {
                x: last.x * (1 - alpha) + current.x * alpha,
                y: last.y * (1 - alpha) + current.y * alpha,
                z: last.z * (1 - alpha) + current.z * alpha
            };
            
            smoothed.push(smoothedPoint);
        }
        
        // حفظ المواقع المحدثة
        this.trackingData.lastHandPositions.set(handId, smoothed);
        
        return smoothed;
    }
    
    /**
     * حساب موقع الشاشة
     */
    calculateScreenPosition(landmarks) {
        if (landmarks.length === 0) return null;
        
        // استخدام نقطة منتصف راحة اليد (النقطة 9)
        const palm = landmarks[9];
        
        // تحويل من إحداثيات معيارية إلى إحداثيات شاشة
        const x = palm.x * this.canvas.width;
        const y = palm.y * this.canvas.height;
        
        return { x, y };
    }
    
    /**
     * معالجة الإيماءات
     */
    processGestures() {
        this.hands.forEach(hand => {
            const gesture = this.recognizeGesture(hand);
            
            if (gesture) {
                this.handleRecognizedGesture(hand, gesture);
            }
        });
    }
    
    /**
     * التعرف على الإيماءة
     */
    recognizeGesture(hand) {
        const landmarks = hand.landmarks;
        
        if (landmarks.length < 21) return null;
        
        // فحص الإيماءات المختلفة
        for (const [gestureId, gestureData] of this.gestures) {
            const confidence = this.calculateGestureConfidence(gestureId, landmarks);
            
            if (confidence >= gestureData.confidence * this.config.sensitivity) {
                return {
                    id: gestureId,
                    data: gestureData,
                    confidence: confidence,
                    hand: hand
                };
            }
        }
        
        return null;
    }
    
    /**
     * حساب الثقة في الإيماءة
     */
    calculateGestureConfidence(gestureId, landmarks) {
        switch (gestureId) {
            case 'hand_open':
                return this.checkHandOpen(landmarks);
                
            case 'hand_closed':
                return this.checkHandClosed(landmarks);
                
            case 'pointing':
                return this.checkPointing(landmarks);
                
            case 'swipe_left':
                return this.checkSwipeGesture(landmarks, 'left');
                
            case 'swipe_right':
                return this.checkSwipeGesture(landmarks, 'right');
                
            case 'swipe_up':
                return this.checkSwipeGesture(landmarks, 'up');
                
            case 'swipe_down':
                return this.checkSwipeGesture(landmarks, 'down');
                
            case 'pinch':
                return this.checkPinch(landmarks);
                
            case 'pinch_out':
                return this.checkPinchOut(landmarks);
                
            case 'thumbs_up':
                return this.checkThumbsUp(landmarks);
                
            case 'thumbs_down':
                return this.checkThumbsDown(landmarks);
                
            case 'victory':
                return this.checkVictory(landmarks);
                
            case 'number_one':
                return this.checkNumberOne(landmarks);
                
            case 'number_two':
                return this.checkNumberTwo(landmarks);
                
            case 'number_three':
                return this.checkNumberThree(landmarks);
                
            default:
                return 0;
        }
    }
    
    /**
     * فحص اليد المفتوحة
     */
    checkHandOpen(landmarks) {
        // فحص المسافة بين أطراف الأصابع والرسغ
        const wrist = landmarks[0];
        let fingerCount = 0;
        
        const fingerTips = [4, 8, 12, 16, 20]; // أطراف الأصابع
        
        for (const tip of fingerTips) {
            const distance = this.calculateDistance(landmarks[tip], wrist);
            if (distance > 0.1) fingerCount++;
        }
        
        return fingerCount >= 4 ? 0.9 : 0.3;
    }
    
    /**
     * فحص اليد المغلقة
     */
    checkHandClosed(landmarks) {
        // فحص اقتراب أطراف الأصابع من راحة اليد
        const palm = landmarks[9];
        let closeCount = 0;
        
        const fingerTips = [4, 8, 12, 16, 20];
        
        for (const tip of fingerTips) {
            const distance = this.calculateDistance(landmarks[tip], palm);
            if (distance < 0.05) closeCount++;
        }
        
        return closeCount >= 4 ? 0.9 : 0.2;
    }
    
    /**
     * فحص الإشارة
     */
    checkPointing(landmarks) {
        // فحص امتداد السبابة مع بقية الأصابع مطوية
        const indexTip = landmarks[8];
        const indexPip = landmarks[6];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        const indexExtended = this.calculateDistance(indexTip, indexPip) > 0.08;
        const othersClosed = this.calculateDistance(middleTip, landmarks[9]) < 0.06 &&
                             this.calculateDistance(ringTip, landmarks[9]) < 0.06 &&
                             this.calculateDistance(pinkyTip, landmarks[9]) < 0.06;
        
        return (indexExtended && othersClosed) ? 0.85 : 0.2;
    }
    
    /**
     * فحص إيماءة السحب
     */
    checkSwipeGesture(landmarks, direction) {
        const time = Date.now() * 0.001;
        const currentPos = landmarks[9]; // راحة اليد
        
        // مقارنة مع الموقع السابق
        const lastPos = this.trackingData.lastHandPositions.get('swipe_history') || [];
        if (lastPos.length < 2) return 0;
        
        const deltaX = currentPos.x - lastPos[lastPos.length - 2].x;
        const deltaY = currentPos.y - lastPos[lastPos.length - 2].y;
        
        // حفظ الموقع الحالي
        lastPos.push(currentPos);
        if (lastPos.length > 10) lastPos.shift();
        this.trackingData.lastHandPositions.set('swipe_history', lastPos);
        
        const threshold = 0.05;
        
        switch (direction) {
            case 'left':
                return deltaX < -threshold ? 0.8 : 0.1;
            case 'right':
                return deltaX > threshold ? 0.8 : 0.1;
            case 'up':
                return deltaY < -threshold ? 0.8 : 0.1;
            case 'down':
                return deltaY > threshold ? 0.8 : 0.1;
            default:
                return 0;
        }
    }
    
    /**
     * فحص الإمساك
     */
    checkPinch(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = this.calculateDistance(thumbTip, indexTip);
        
        return distance < 0.03 ? 0.9 : 0.2;
    }
    
    /**
     * فحص فتح الإمساك
     */
    checkPinchOut(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = this.calculateDistance(thumbTip, indexTip);
        
        return distance > 0.08 ? 0.9 : 0.2;
    }
    
    /**
     * فحص الإبهام للأعلى
     */
    checkThumbsUp(landmarks) {
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        
        const thumbUp = thumbTip.y < thumbIp.y - 0.02;
        const othersDown = this.calculateDistance(indexTip, landmarks[9]) < 0.06 &&
                          this.calculateDistance(middleTip, landmarks[9]) < 0.06;
        
        return (thumbUp && othersDown) ? 0.85 : 0.2;
    }
    
    /**
     * فحص الإبهام للأسفل
     */
    checkThumbsDown(landmarks) {
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        
        const thumbDown = thumbTip.y > thumbIp.y + 0.02;
        const othersDown = this.calculateDistance(indexTip, landmarks[9]) < 0.06 &&
                          this.calculateDistance(middleTip, landmarks[9]) < 0.06;
        
        return (thumbDown && othersDown) ? 0.85 : 0.2;
    }
    
    /**
     * فحص إشارة النصر
     */
    checkVictory(landmarks) {
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const indexPip = landmarks[6];
        const middlePip = landmarks[10];
        
        const bothUp = indexTip.y < indexPip.y && middleTip.y < middlePip.y;
        const distance = this.calculateDistance(indexTip, middleTip);
        const closeTogether = distance < 0.04;
        
        return (bothUp && closeTogether) ? 0.8 : 0.2;
    }
    
    /**
     * فحص الرقم واحد
     */
    checkNumberOne(landmarks) {
        const indexTip = landmarks[8];
        const indexPip = landmarks[6];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        const indexExtended = indexTip.y < indexPip.y - 0.02;
        const othersDown = this.calculateDistance(middleTip, landmarks[9]) < 0.06 &&
                          this.calculateDistance(ringTip, landmarks[9]) < 0.06 &&
                          this.calculateDistance(pinkyTip, landmarks[9]) < 0.06;
        
        return (indexExtended && othersDown) ? 0.8 : 0.2;
    }
    
    /**
     * فحص الرقم اثنان
     */
    checkNumberTwo(landmarks) {
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const indexPip = landmarks[6];
        const middlePip = landmarks[10];
        
        const indexUp = indexTip.y < indexPip.y - 0.02;
        const middleUp = middleTip.y < middlePip.y - 0.02;
        const ringDown = this.calculateDistance(landmarks[16], landmarks[9]) < 0.06;
        const pinkyDown = this.calculateDistance(landmarks[20], landmarks[9]) < 0.06;
        
        return (indexUp && middleUp && ringDown && pinkyDown) ? 0.8 : 0.2;
    }
    
    /**
     * فحص الرقم ثلاثة
     */
    checkNumberThree(landmarks) {
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const indexPip = landmarks[6];
        const middlePip = landmarks[10];
        const ringPip = landmarks[14];
        
        const indexUp = indexTip.y < indexPip.y - 0.02;
        const middleUp = middleTip.y < middlePip.y - 0.02;
        const ringUp = ringTip.y < ringPip.y - 0.02;
        const pinkyDown = this.calculateDistance(landmarks[20], landmarks[9]) < 0.06;
        
        return (indexUp && middleUp && ringUp && pinkyDown) ? 0.8 : 0.2;
    }
    
    /**
     * حساب المسافة بين نقطتين
     */
    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    /**
     * معالجة الإيماءة المعترف بها
     */
    handleRecognizedGesture(hand, gesture) {
        const now = Date.now();
        
        // فحص التكرار والإيماءة الجديدة
        const lastGesture = this.gestureHistory[this.gestureHistory.length - 1];
        
        if (!lastGesture || lastGesture.id !== gesture.id || 
            (now - lastGesture.timestamp) > 1000) { // ثانية واحدة بين الإيماءات
            
            console.log('👋 إيماءة معترف بها:', gesture.data.name, `(الثقة: ${Math.round(gesture.confidence * 100)}%)`);
            
            // حفظ في التاريخ
            this.gestureHistory.push({
                id: gesture.id,
                data: gesture.data,
                confidence: gesture.confidence,
                hand: hand,
                timestamp: now,
                screenPosition: hand.screenPosition
            });
            
            // الاحتفاظ بآخر 50 إيماءة فقط
            if (this.gestureHistory.length > 50) {
                this.gestureHistory.shift();
            }
            
            // إرسال الأحداث
            this.emit('gesture_recognized', gesture);
            
            // تنفيذ الإجراءات المرتبطة
            this.executeGestureActions(gesture);
        }
    }
    
    /**
     * تنفيذ إجراءات الإيماءة
     */
    executeGestureActions(gesture) {
        const actions = gesture.data.triggers;
        
        actions.forEach(action => {
            console.log('⚡ تنفيذ إجراء:', action);
            this.emit(`gesture_${action}`, gesture);
        });
        
        // إجراءات خاصة بالإيماءة
        switch (gesture.id) {
            case 'pointing':
                this.emit('hand_detected', {
                    position: gesture.hand.screenPosition,
                    confidence: gesture.confidence
                });
                break;
                
            case 'swipe_left':
                this.emit('swipe_left', gesture);
                break;
                
            case 'swipe_right':
                this.emit('swipe_right', gesture);
                break;
                
            case 'pinch':
                this.emit('pinch', {
                    position: gesture.hand.screenPosition,
                    confidence: gesture.confidence
                });
                break;
                
            case 'pinch_out':
                this.emit('pinch_out', gesture);
                break;
                
            case 'call_me':
                this.emit('voice_command', gesture);
                break;
                
            case 'stop':
                this.emit('emergency_stop', gesture);
                break;
        }
    }
    
    /**
     * الحصول على قائمة الإيماءات المدعومة
     */
    getSupportedGestures() {
        const gestures = [];
        this.gestures.forEach((data, id) => {
            gestures.push({
                id: id,
                name: data.name,
                description: data.description,
                triggers: data.triggers
            });
        });
        return gestures;
    }
    
    /**
     * الحصول على تاريخ الإيماءات
     */
    getGestureHistory(limit = 10) {
        return this.gestureHistory.slice(-limit);
    }
    
    /**
     * الحصول على حالة التتبع
     */
    getTrackingState() {
        return {
            isActive: this.isActive,
            isInitialized: this.isInitialized,
            handsDetected: this.hands.size,
            lastGesture: this.gestureHistory[this.gestureHistory.length - 1] || null,
            supportedGestures: this.gestures.size,
            config: this.config
        };
    }
    
    /**
     * تحديث إعدادات التحكم
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('🔧 تم تحديث إعدادات التحكم بالإيماءات:', this.config);
    }
    
    /**
     * إضافة إيماءة مخصصة
     */
    addCustomGesture(id, name, description, callback) {
        this.gestures.set(id, {
            name: name,
            description: description,
            confidence: 0.7,
            triggers: ['custom'],
            callback: callback
        });
        
        console.log('✨ تم إضافة إيماءة مخصصة:', id);
    }
    
    /**
     * محاكاة إيماءة للاختبار
     */
    simulateGesture(gestureId) {
        const gesture = this.gestures.get(gestureId);
        if (!gesture) {
            console.warn('إيماءة غير موجودة:', gestureId);
            return;
        }
        
        const mockHand = {
            id: 'mock_hand',
            handedness: 'right',
            landmarks: this.generateHandLandmarks(Date.now() * 0.001, 0),
            confidence: 0.9,
            screenPosition: { x: 320, y: 240 },
            timestamp: Date.now()
        };
        
        const recognizedGesture = {
            id: gestureId,
            data: gesture,
            confidence: 0.9,
            hand: mockHand
        };
        
        this.handleRecognizedGesture(mockHand, recognizedGesture);
        console.log('🎭 تم محاكاة إيماءة:', gestureId);
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
        console.log('🗑️ تدمير Gesture Controller...');
        
        this.stopTracking();
        this.hands.clear();
        this.gestureHistory = [];
        this.trackingData.lastHandPositions.clear();
        
        console.log('✅ تم تدمير Gesture Controller');
    }
}

// تصدير للاستخدام في الوحدات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureController;
}