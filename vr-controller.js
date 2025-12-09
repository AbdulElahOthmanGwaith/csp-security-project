/**
 * 🎭 VR Controller - تحكم الواقع الافتراضي
 * نظام متقدم للتحكم في بيئة الواقع الافتراضي لمركز القيادة الغامر
 * 
 * المميزات:
 * - تحكم كامل باليدين
 * - تتبع العين (اختياري)
 * - تفاعل ثلاثي الأبعاد مع التهديدات
 * - واجهة صوتية غامرة
 * - حفظ الجلسات
 * 
 * @author MiniMax Agent
 * @version 2025.12.10
 */

class VRController {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.isInitialized = false;
        this.isSessionActive = false;
        this.session = null;
        this.referenceSpace = null;
        this.controllers = [];
        this.laserPointers = [];
        this.currentTarget = null;
        
        // إعدادات VR
        this.config = {
            sessionType: 'immersive-vr',
            requiredFeatures: ['local-floor'],
            optionalFeatures: ['hand-tracking', 'eye-tracking'],
            maxControllers: 2,
            laserPointerLength: 10,
            hapticFeedback: true,
            saveSessions: true
        };
        
        // محاكاة أجهزة التحكم
        this.mockControllers = this.createMockControllers();
        
        console.log('🥽 تم تهيئة VR Controller');
    }
    
    /**
     * تهيئة نظام VR
     */
    async initialize() {
        try {
            console.log('🔧 بدء تهيئة VR...');
            
            // فحص دعم WebXR
            if (!navigator.xr) {
                throw new Error('WebXR غير مدعوم في هذا المتصفح');
            }
            
            // فحص دعم VR
            const isVRAvailable = await navigator.xr.isSessionSupported(this.config.sessionType);
            if (!isVRAvailable) {
                throw new Error('VR غير متاح على هذا الجهاز');
            }
            
            // إنشاء أجهزة التحكم الافتراضية
            this.createControllers();
            
            // إعداد تتبع العين (إذا كان متاحاً)
            if (this.config.optionalFeatures.includes('eye-tracking')) {
                await this.initializeEyeTracking();
            }
            
            this.isInitialized = true;
            console.log('✅ تم تهيئة VR بنجاح');
            
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة VR:', error);
            throw error;
        }
    }
    
    /**
     * إنشاء أجهزة التحكم الافتراضية
     */
    createControllers() {
        for (let i = 0; i < this.config.maxControllers; i++) {
            const controller = {
                id: `controller_${i}`,
                handedness: i === 0 ? 'left' : 'right',
                gamepad: {
                    axes: [0, 0, 0, 0],
                    buttons: [
                        { pressed: false, value: 0 }, // Trigger
                        { pressed: false, value: 0 }, // Grip
                        { pressed: false, value: 0 }, // A/Primary
                        { pressed: false, value: 0 }, // B/Secondary
                        { pressed: false, value: 0 }, // Thumbstick
                        { pressed: false, value: 0 }  // Touchpad
                    ],
                    hapticActuators: [
                        {
                            pulse: (intensity, duration) => {
                                console.log(`📳 اهتزاز جهاز التحكم ${i}: ${intensity}% لمدة ${duration}ms`);
                                return Promise.resolve();
                            }
                        }
                    ]
                },
                connected: true,
                pose: {
                    position: { x: 0, y: 1.5, z: 0 },
                    orientation: { x: 0, y: 0, z: 0, w: 1 }
                }
            };
            
            this.controllers.push(controller);
            this.createLaserPointer(controller);
        }
    }
    
    /**
     * إنشاء شعاع الليزر لجهاز التحكم
     */
    createLaserPointer(controller) {
        const geometry = new THREE.CylinderGeometry(0.002, 0.002, this.config.laserPointerLength, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const laser = new THREE.Mesh(geometry, material);
        laser.rotation.x = Math.PI / 2;
        laser.visible = false;
        
        // إضافة تأثير الإضاءة
        const glowGeometry = new THREE.SphereGeometry(0.01, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        laser.add(glow);
        
        this.scene.add(laser);
        this.laserPointers.push({
            mesh: laser,
            controller: controller,
            visible: false
        });
    }
    
    /**
     * تهيئة تتبع العين
     */
    async initializeEyeTracking() {
        console.log('👁️ تهيئة تتبع العين...');
        
        try {
            // محاكاة تتبع العين
            this.eyeTrackingData = {
                leftEye: { x: 0, y: 0, z: -1 },
                rightEye: { x: 0, y: 0, z: -1 },
                combinedGaze: { x: 0, y: 0, z: -1 }
            };
            
            // تحديث بيانات العين
            this.updateEyeTracking();
            
            console.log('✅ تم تهيئة تتبع العين');
            
        } catch (error) {
            console.warn('⚠️ تعذر تهيئة تتبع العين:', error);
        }
    }
    
    /**
     * بدء جلسة VR
     */
    async startSession() {
        if (!this.isInitialized) {
            throw new Error('VR غير مهيأ بعد');
        }
        
        try {
            console.log('🚀 بدء جلسة VR...');
            
            // طلب جلسة VR
            this.session = await navigator.xr.requestSession(this.config.sessionType, {
                requiredFeatures: this.config.requiredFeatures,
                optionalFeatures: this.config.optionalFeatures
            });
            
            // ربط أحداث الجلسة
            this.bindSessionEvents();
            
            // بدء تقديم المشهد
            this.renderer.xr.enabled = true;
            this.renderer.xr.setReferenceSpaceType('local-floor');
            await this.renderer.xr.setSession(this.session);
            
            this.isSessionActive = true;
            this.startSessionLoop();
            
            console.log('✅ تم بدء جلسة VR بنجاح');
            this.emit('session_start');
            
        } catch (error) {
            console.error('❌ خطأ في بدء جلسة VR:', error);
            throw error;
        }
    }
    
    /**
     * إنهاء جلسة VR
     */
    async endSession() {
        if (!this.session || !this.isSessionActive) {
            return;
        }
        
        try {
            console.log('🛑 إنهاء جلسة VR...');
            
            this.isSessionActive = false;
            
            if (this.session) {
                await this.session.end();
                this.session = null;
            }
            
            // إيقاف تقديم المشهد
            this.renderer.xr.enabled = false;
            
            // إخفاء شعاع الليزر
            this.laserPointers.forEach(pointer => {
                pointer.visible = false;
                pointer.mesh.visible = false;
            });
            
            console.log('✅ تم إنهاء جلسة VR');
            this.emit('session_end');
            
        } catch (error) {
            console.error('❌ خطأ في إنهاء جلسة VR:', error);
        }
    }
    
    /**
     * ربط أحداث الجلسة
     */
    bindSessionEvents() {
        this.session.addEventListener('end', () => {
            this.isSessionActive = false;
            this.emit('session_end');
        });
        
        this.session.addEventListener('inputsourceschange', (event) => {
            this.handleInputSourcesChange(event);
        });
        
        this.session.addEventListener('selectstart', (event) => {
            this.handleSelectStart(event);
        });
        
        this.session.addEventListener('selectend', (event) => {
            this.handleSelectEnd(event);
        });
        
        this.session.addEventListener('squeezestart', (event) => {
            this.handleSqueezeStart(event);
        });
        
        this.session.addEventListener('squeezeend', (event) => {
            this.handleSqueezeEnd(event);
        });
    }
    
    /**
     * معالجة تغيير مصادر الإدخال
     */
    handleInputSourcesChange(event) {
        const { added, removed } = event;
        
        added.forEach(inputSource => {
            console.log('➕ إضافة مصدر إدخال:', inputSource.handedness);
            this.handleInputSourceAdded(inputSource);
        });
        
        removed.forEach(inputSource => {
            console.log('➖ إزالة مصدر إدخال:', inputSource.handedness);
            this.handleInputSourceRemoved(inputSource);
        });
    }
    
    /**
     * معالجة إضافة مصدر إدخال
     */
    handleInputSourceAdded(inputSource) {
        // العثور على جهاز التحكم المطابق
        const controller = this.controllers.find(c => c.handedness === inputSource.handedness);
        if (controller) {
            controller.inputSource = inputSource;
            controller.connected = true;
        }
    }
    
    /**
     * معالجة إزالة مصدر إدخال
     */
    handleInputSourceRemoved(inputSource) {
        const controller = this.controllers.find(c => c.inputSource === inputSource);
        if (controller) {
            controller.inputSource = null;
            controller.connected = false;
        }
    }
    
    /**
     * معالجة بدء الاختيار
     */
    handleSelectStart(event) {
        const inputSource = event.inputSource;
        const controller = this.controllers.find(c => c.inputSource === inputSource);
        
        if (controller) {
            console.log('🎯 بدء الاختيار:', controller.handedness);
            
            // تشغيل اهتزاز
            if (this.config.hapticFeedback) {
                this.triggerHaptic(controller, 0.5, 100);
            }
            
            // معالجة الهدف المحدد
            this.handleControllerSelection(controller, event);
        }
    }
    
    /**
     * معالجة نهاية الاختيار
     */
    handleSelectEnd(event) {
        const inputSource = event.inputSource;
        const controller = this.controllers.find(c => c.inputSource === inputSource);
        
        if (controller) {
            console.log('🎯 نهاية الاختيار:', controller.handedness);
            this.currentTarget = null;
        }
    }
    
    /**
     * معالجة بدء الإمساك
     */
    handleSqueezeStart(event) {
        const inputSource = event.inputSource;
        const controller = this.controllers.find(c => c.inputSource === inputSource);
        
        if (controller) {
            console.log('✊ بدء الإمساك:', controller.handedness);
            
            // تشغيل اهتزاز قوي
            if (this.config.hapticFeedback) {
                this.triggerHaptic(controller, 0.8, 200);
            }
            
            this.emit('controller_squeeze', controller);
        }
    }
    
    /**
     * معالجة نهاية الإمساك
     */
    handleSqueezeEnd(event) {
        const inputSource = event.inputSource;
        const controller = this.controllers.find(c => c.inputSource === inputSource);
        
        if (controller) {
            console.log('✊ نهاية الإمساك:', controller.handedness);
        }
    }
    
    /**
     * معالجة اختيار جهاز التحكم
     */
    handleControllerSelection(controller, event) {
        // فحص التفاعل مع الكائنات ثلاثية الأبعاد
        const intersections = this.raycast(controller);
        
        if (intersections.length > 0) {
            const target = intersections[0].object;
            this.currentTarget = target;
            
            console.log('🎯 تم تحديد هدف:', target.userData);
            
            // إرسال حدث التحديد
            this.emit('controller_select', {
                controller: controller,
                target: target,
                intersection: intersections[0]
            });
            
            // تأثير بصري
            this.showSelectionEffect(target);
        }
    }
    
    /**
     * إجراء شعاع للجهاز التحكم
     */
    raycast(controller) {
        // إنشاء شعاع من جهاز التحكم
        const origin = new THREE.Vector3(
            controller.pose.position.x,
            controller.pose.position.y,
            controller.pose.position.z
        );
        
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(new THREE.Quaternion(
            controller.pose.orientation.x,
            controller.pose.orientation.y,
            controller.pose.orientation.z,
            controller.pose.orientation.w
        ));
        
        const raycaster = new THREE.Raycaster(origin, direction);
        return raycaster.intersectObjects(this.scene.children, true);
    }
    
    /**
     * تشغيل اهتزاز جهاز التحكم
     */
    async triggerHaptic(controller, intensity = 0.5, duration = 100) {
        try {
            const hapticActuator = controller.gamepad?.hapticActuators?.[0];
            if (hapticActuator) {
                await hapticActuator.pulse(intensity, duration);
            }
        } catch (error) {
            console.warn('تعذر تشغيل الاهتزاز:', error);
        }
    }
    
    /**
     * عرض تأثير التحديد
     */
    showSelectionEffect(target) {
        // إنشاء تأثير توهج
        const glowGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(target.position);
        
        this.scene.add(glow);
        
        // إزالة التأثير بعد ثانيتين
        setTimeout(() => {
            this.scene.remove(glow);
        }, 2000);
    }
    
    /**
     * بدء حلقة الجلسة
     */
    startSessionLoop() {
        const animate = () => {
            if (!this.isSessionActive) return;
            
            // تحديث أجهزة التحكم
            this.updateControllers();
            
            // تحديث شعاع الليزر
            this.updateLaserPointers();
            
            // تحديث تتبع العين
            this.updateEyeTracking();
            
            // طلب الإطار التالي
            this.session.requestAnimationFrame(animate);
        };
        
        this.session.requestAnimationFrame(animate);
    }
    
    /**
     * تحديث أجهزة التحكم
     */
    updateControllers() {
        this.controllers.forEach((controller, index) => {
            if (!controller.connected) return;
            
            // محاكاة حركة جهاز التحكم
            this.simulateControllerMovement(controller);
            
            // تحديث بيانات المحرك
            this.updateControllerGamepad(controller);
        });
    }
    
    /**
     * محاكاة حركة جهاز التحكم
     */
    simulateControllerMovement(controller) {
        const time = Date.now() * 0.001;
        
        // حركة طبيعية لليد
        controller.pose.position.x = Math.sin(time * 0.5) * 0.3;
        controller.pose.position.y = 1.2 + Math.sin(time * 0.8) * 0.1;
        controller.pose.position.z = Math.cos(time * 0.3) * 0.2;
        
        // توجيه الجهاز
        controller.pose.orientation.x = Math.sin(time * 0.3) * 0.1;
        controller.pose.orientation.y = Math.cos(time * 0.4) * 0.1;
        controller.pose.orientation.z = Math.sin(time * 0.6) * 0.1;
    }
    
    /**
     * تحديث بيانات المحرك
     */
    updateControllerGamepad(controller) {
        const time = Date.now() * 0.001;
        
        // محاكاة حركة العصا التناظرية
        controller.gamepad.axes[0] = Math.sin(time * 0.5) * 0.7; // X
        controller.gamepad.axes[1] = Math.cos(time * 0.7) * 0.7; // Y
        
        // أزرار عشوائية
        controller.gamepad.buttons.forEach((button, index) => {
            if (index < 2) { // Trigger and Grip
                button.pressed = Math.random() > 0.95;
                button.value = button.pressed ? 1 : 0;
            }
        });
    }
    
    /**
     * تحديث شعاع الليزر
     */
    updateLaserPointers() {
        this.laserPointers.forEach(pointer => {
            const controller = pointer.controller;
            
            if (!controller.connected) {
                pointer.mesh.visible = false;
                return;
            }
            
            // تحديد موقع الجهاز
            pointer.mesh.position.set(
                controller.pose.position.x,
                controller.pose.position.y,
                controller.pose.position.z
            );
            
            // تحديد توجيه الجهاز
            const quaternion = new THREE.Quaternion(
                controller.pose.orientation.x,
                controller.pose.orientation.y,
                controller.pose.orientation.z,
                controller.pose.orientation.w
            );
            
            pointer.mesh.setRotationFromQuaternion(quaternion);
            
            // فحص التفاعل مع الأهداف
            const intersections = this.raycast(controller);
            
            if (intersections.length > 0) {
                pointer.mesh.visible = true;
                
                // تحديد نهاية الشعاع
                const intersection = intersections[0];
                const distance = intersection.distance;
                
                // تحديد طول الشعاع
                pointer.mesh.scale.z = distance / this.config.laserPointerLength;
                
                // تغيير لون الشعاع عند التفاعل
                pointer.mesh.material.color.setHex(0x34d399);
            } else {
                pointer.mesh.visible = true;
                pointer.mesh.scale.z = 1;
                pointer.mesh.material.color.setHex(0x22d3ee);
            }
        });
    }
    
    /**
     * تحديث تتبع العين
     */
    updateEyeTracking() {
        if (!this.eyeTrackingData) return;
        
        const time = Date.now() * 0.001;
        
        // محاكاة حركة العين
        this.eyeTrackingData.leftEye.x = Math.sin(time * 0.3) * 0.1;
        this.eyeTrackingData.leftEye.y = Math.cos(time * 0.4) * 0.1;
        this.eyeTrackingData.leftEye.z = -1;
        
        this.eyeTrackingData.rightEye.x = Math.sin(time * 0.3) * 0.1;
        this.eyeTrackingData.rightEye.y = Math.cos(time * 0.4) * 0.1;
        this.eyeTrackingData.rightEye.z = -1;
        
        // حساب الاتجاه المدمج
        this.eyeTrackingData.combinedGaze.x = (this.eyeTrackingData.leftEye.x + this.eyeTrackingData.rightEye.x) / 2;
        this.eyeTrackingData.combinedGaze.y = (this.eyeTrackingData.leftEye.y + this.eyeTrackingData.rightEye.y) / 2;
        this.eyeTrackingData.combinedGaze.z = -1;
        
        // معالجة نظرة التركيز
        this.handleGazeFocus();
    }
    
    /**
     * معالجة نظرة التركيز
     */
    handleGazeFocus() {
        // إنشاء شعاع من العين
        const origin = new THREE.Vector3(0, 1.6, 0); // موقع الرأس
        const direction = new THREE.Vector3(
            this.eyeTrackingData.combinedGaze.x,
            this.eyeTrackingData.combinedGaze.y,
            this.eyeTrackingData.combinedGaze.z
        );
        
        const raycaster = new THREE.Raycaster(origin, direction);
        const intersections = raycaster.intersectObjects(this.scene.children, true);
        
        if (intersections.length > 0) {
            const target = intersections[0].object;
            
            // تأثير نظرة التركيز
            if (target !== this.gazeTarget) {
                this.showGazeEffect(target);
                this.gazeTarget = target;
            }
        }
    }
    
    /**
     * عرض تأثير النظر
     */
    showGazeEffect(target) {
        // إنشاء نقطة توهج
        const gazeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const gazeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const gazePoint = new THREE.Mesh(gazeGeometry, gazeMaterial);
        gazePoint.position.copy(target.position);
        
        this.scene.add(gazePoint);
        
        // إزالة التأثير بعد ثانية واحدة
        setTimeout(() => {
            this.scene.remove(gazePoint);
        }, 1000);
    }
    
    /**
     * إنشاء أجهزة تحكم وهمية للاختبار
     */
    createMockControllers() {
        return [
            {
                id: 'mock_left',
                handedness: 'left',
                connected: true,
                buttons: {
                    trigger: { pressed: false, value: 0 },
                    grip: { pressed: false, value: 0 },
                    a: { pressed: false, value: 0 },
                    b: { pressed: false, value: 0 },
                    thumbstick: { pressed: false, value: 0 }
                },
                axes: [0, 0, 0, 0]
            },
            {
                id: 'mock_right',
                handedness: 'right',
                connected: true,
                buttons: {
                    trigger: { pressed: false, value: 0 },
                    grip: { pressed: false, value: 0 },
                    a: { pressed: false, value: 0 },
                    b: { pressed: false, value: 0 },
                    thumbstick: { pressed: false, value: 0 }
                },
                axes: [0, 0, 0, 0]
            }
        ];
    }
    
    /**
     * الحصول على حالة الأجهزة
     */
    getControllersState() {
        return this.controllers.map(controller => ({
            id: controller.id,
            handedness: controller.handedness,
            connected: controller.connected,
            position: controller.pose.position,
            orientation: controller.pose.orientation,
            buttons: controller.gamepad.buttons.map(btn => ({
                pressed: btn.pressed,
                value: btn.value
            })),
            axes: [...controller.gamepad.axes]
        }));
    }
    
    /**
     * محاكاة إدخال
     */
    simulateInput(controllerId, input) {
        const controller = this.controllers.find(c => c.id === controllerId);
        if (!controller) return;
        
        console.log('🎮 محاكاة إدخال:', controllerId, input);
        
        // معالجة أنواع الإدخال المختلفة
        switch (input.type) {
            case 'button':
                controller.gamepad.buttons[input.button].pressed = input.pressed;
                controller.gamepad.buttons[input.button].value = input.value || (input.pressed ? 1 : 0);
                break;
                
            case 'axis':
                controller.gamepad.axes[input.axis] = input.value;
                break;
                
            case 'position':
                controller.pose.position = input.position;
                break;
                
            case 'orientation':
                controller.pose.orientation = input.orientation;
                break;
        }
    }
    
    /**
     * حفظ الجلسة
     */
    saveSession() {
        if (!this.config.saveSessions || !this.isSessionActive) return;
        
        try {
            const sessionData = {
                timestamp: new Date().toISOString(),
                controllers: this.getControllersState(),
                gazeTarget: this.gazeTarget?.userData || null,
                sceneState: this.captureSceneState()
            };
            
            localStorage.setItem('vrSession', JSON.stringify(sessionData));
            console.log('💾 تم حفظ جلسة VR');
            
        } catch (error) {
            console.warn('تعذر حفظ الجلسة:', error);
        }
    }
    
    /**
     * تحميل الجلسة
     */
    loadSession() {
        try {
            const sessionData = localStorage.getItem('vrSession');
            if (!sessionData) return false;
            
            const session = JSON.parse(sessionData);
            console.log('📁 تحميل جلسة VR:', session.timestamp);
            
            // استعادة حالة الأجهزة
            session.controllers.forEach(savedController => {
                const controller = this.controllers.find(c => c.id === savedController.id);
                if (controller) {
                    controller.pose.position = savedController.position;
                    controller.pose.orientation = savedController.orientation;
                }
            });
            
            return true;
            
        } catch (error) {
            console.warn('تعذر تحميل الجلسة:', error);
            return false;
        }
    }
    
    /**
     * التقاط حالة المشهد
     */
    captureSceneState() {
        const objects = [];
        this.scene.traverse((object) => {
            if (object.userData.threat) {
                objects.push({
                    id: object.userData.threat.id,
                    type: object.userData.threat.type,
                    position: object.position.toArray(),
                    rotation: object.rotation.toArray(),
                    scale: object.scale.toArray()
                });
            }
        });
        return objects;
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
        console.log('🗑️ تدمير VR Controller...');
        
        // إنهاء الجلسة النشطة
        if (this.isSessionActive) {
            this.endSession();
        }
        
        // تنظيف الموارد
        this.laserPointers.forEach(pointer => {
            this.scene.remove(pointer.mesh);
        });
        
        this.controllers = [];
        this.laserPointers = [];
        
        console.log('✅ تم تدمير VR Controller');
    }
}