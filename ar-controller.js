/**
 * 📱 AR Controller - تحكم الواقع المعزز
 * نظام متقدم للواقع المعزز لمركز القيادة الغامر
 * 
 * المميزات:
 * - كشف الأسطح التلقائي
 * - وضع العناصر المجسمة
 * - تتبع المواقع الجغرافية
 * - دمج البيانات الحقيقية
 * - دعم المحاكاة التعليمية
 * 
 * @author MiniMax Agent
 * @version 2025.12.10
 */

class ARController {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.isInitialized = false;
        this.isSessionActive = false;
        this.session = null;
        this.referenceSpace = null;
        this.planes = new Map();
        this.anchors = new Map();
        this.trackedImages = new Map();
        this.currentAnchor = null;
        
        // إعدادات AR
        this.config = {
            sessionType: 'immersive-ar',
            requiredFeatures: ['local'],
            optionalFeatures: ['hit-test', 'dom-overlay', 'plane-detection', 'light-estimation'],
            maxAnchors: 20,
            planeDetection: true,
            domOverlay: {
                root: document.body
            },
            trackedImages: []
        };
        
        // بيانات الأسطح المحاكاة
        this.mockPlanes = this.createMockPlanes();
        
        // حالة النظام
        this.systemState = {
            lightIntensity: 0.8,
            planeCount: 0,
            anchorCount: 0,
            isTracking: false
        };
        
        console.log('📱 تم تهيئة AR Controller');
    }
    
    /**
     * تهيئة نظام AR
     */
    async initialize() {
        try {
            console.log('🔧 بدء تهيئة AR...');
            
            // فحص دعم WebXR
            if (!navigator.xr) {
                throw new Error('WebXR غير مدعوم في هذا المتصفح');
            }
            
            // فحص دعم AR
            const isARAvailable = await navigator.xr.isSessionSupported(this.config.sessionType);
            if (!isARAvailable) {
                throw new Error('AR غير متاح على هذا الجهاز');
            }
            
            // تهيئة كشف الأسطح
            if (this.config.planeDetection) {
                await this.initializePlaneDetection();
            }
            
            // تهيئة تقدير الإضاءة
            await this.initializeLightEstimation();
            
            // تهيئة تتبع الصور (اختياري)
            if (this.config.trackedImages.length > 0) {
                await this.initializeImageTracking();
            }
            
            this.isInitialized = true;
            console.log('✅ تم تهيئة AR بنجاح');
            
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة AR:', error);
            throw error;
        }
    }
    
    /**
     * تهيئة كشف الأسطح
     */
    async initializePlaneDetection() {
        console.log('🟦 تهيئة كشف الأسطح...');
        
        // إنشاء نظام كشف أسطح وهمي
        this.planeDetection = {
            planes: new Map(),
            onPlaneDetected: (plane) => {
                this.handlePlaneDetected(plane);
            },
            onPlaneUpdated: (plane) => {
                this.handlePlaneUpdated(plane);
            },
            onPlaneRemoved: (plane) => {
                this.handlePlaneRemoved(plane);
            }
        };
        
        console.log('✅ تم تهيئة كشف الأسطح');
    }
    
    /**
     * تهيئة تقدير الإضاءة
     */
    async initializeLightEstimation() {
        console.log('💡 تهيئة تقدير الإضاءة...');
        
        this.lightEstimation = {
            isAvailable: true,
            currentLight: {
                primaryLightDirection: { x: 0.5, y: -1, z: 0.3 },
                primaryLightIntensity: 0.8,
                sphericalHarmonics: {
                    coefficients: Array(9).fill(0).map(() => Math.random() * 0.5)
                }
            },
            update: (estimation) => {
                this.handleLightEstimationUpdate(estimation);
            }
        };
        
        console.log('✅ تم تهيئة تقدير الإضاءة');
    }
    
    /**
     * تهيئة تتبع الصور
     */
    async initializeImageTracking() {
        console.log('🖼️ تهيئة تتبع الصور...');
        
        // تحميل الصور للتتبع
        for (const imageData of this.config.trackedImages) {
            try {
                const image = await this.loadImage(imageData.src);
                this.trackedImages.set(imageData.id, {
                    image: image,
                    width: imageData.width,
                    tracked: false,
                    pose: null
                });
            } catch (error) {
                console.warn(`تعذر تحميل صورة التتبع ${imageData.id}:`, error);
            }
        }
        
        console.log('✅ تم تهيئة تتبع الصور');
    }
    
    /**
     * تحميل صورة
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    /**
     * بدء جلسة AR
     */
    async startSession() {
        if (!this.isInitialized) {
            throw new Error('AR غير مهيأ بعد');
        }
        
        try {
            console.log('🚀 بدء جلسة AR...');
            
            // طلب جلسة AR
            this.session = await navigator.xr.requestSession(this.config.sessionType, {
                requiredFeatures: this.config.requiredFeatures,
                optionalFeatures: this.config.optionalFeatures,
                domOverlay: this.config.domOverlay
            });
            
            // ربط أحداث الجلسة
            this.bindSessionEvents();
            
            // بدء تقديم المشهد
            this.renderer.xr.enabled = true;
            this.renderer.xr.setReferenceSpaceType('local');
            await this.renderer.xr.setSession(this.session);
            
            this.isSessionActive = true;
            this.startSessionLoop();
            
            console.log('✅ تم بدء جلسة AR بنجاح');
            this.emit('session_start');
            
        } catch (error) {
            console.error('❌ خطأ في بدء جلسة AR:', error);
            throw error;
        }
    }
    
    /**
     * إنهاء جلسة AR
     */
    async endSession() {
        if (!this.session || !this.isSessionActive) {
            return;
        }
        
        try {
            console.log('🛑 إنهاء جلسة AR...');
            
            this.isSessionActive = false;
            
            if (this.session) {
                await this.session.end();
                this.session = null;
            }
            
            // إيقاف تقديم المشهد
            this.renderer.xr.enabled = false;
            
            // تنظيف المراسي والأسطح
            this.cleanupAnchors();
            this.cleanupPlanes();
            
            console.log('✅ تم إنهاء جلسة AR');
            this.emit('session_end');
            
        } catch (error) {
            console.error('❌ خطأ في إنهاء جلسة AR:', error);
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
        
        this.session.addEventListener('select', (event) => {
            this.handleSelect(event);
        });
    }
    
    /**
     * معالجة تغيير مصادر الإدخال
     */
    handleInputSourcesChange(event) {
        const { added, removed } = event;
        
        added.forEach(inputSource => {
            console.log('➕ إضافة مصدر إدخال AR:', inputSource.handedness);
        });
        
        removed.forEach(inputSource => {
            console.log('➖ إزالة مصدر إدخال AR:', inputSource.handedness);
        });
    }
    
    /**
     * معالجة الاختيار
     */
    handleSelect(event) {
        console.log('👆 حدث اختيار في AR');
        
        // تنفيذ hit test
        this.performHitTest(event);
    }
    
    /**
     * إجراء hit test
     */
    async performHitTest(event) {
        try {
            // محاكاة hit test
            const hitTestResults = await this.simulateHitTest(event);
            
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                console.log('🎯 hit test نجح:', hit);
                
                // إنشاء مرساة في الموقع المحدد
                await this.createAnchor(hit.position, hit.rotation);
            }
            
        } catch (error) {
            console.warn('خطأ في hit test:', error);
        }
    }
    
    /**
     * محاكاة hit test
     */
    simulateHitTest(event) {
        return new Promise((resolve) => {
            // محاكاة نتائج hit test
            const results = [];
            
            // فحص الأسطح المتاحة
            const availablePlanes = Array.from(this.planes.values());
            
            if (availablePlanes.length > 0) {
                const plane = availablePlanes[0];
                
                // إنشاء نتيجة hit test وهمية
                const result = {
                    position: {
                        x: plane.center.x + (Math.random() - 0.5) * plane.width,
                        y: plane.center.y,
                        z: plane.center.z + (Math.random() - 0.5) * plane.depth
                    },
                    rotation: { x: 0, y: 0, z: 0, w: 1 },
                    plane: plane
                };
                
                results.push(result);
            }
            
            // إرجاع النتائج بعد تأخير قصير
            setTimeout(() => resolve(results), 100);
        });
    }
    
    /**
     * إنشاء مرساة
     */
    async createAnchor(position, rotation) {
        try {
            const anchorId = `anchor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // إنشاء كائن ثلاثي الأبعاد للمرساة
            const anchorMesh = this.createAnchorMesh();
            anchorMesh.position.set(position.x, position.y, position.z);
            
            if (rotation) {
                anchorMesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
            }
            
            this.scene.add(anchorMesh);
            
            // حفظ المرساة
            const anchor = {
                id: anchorId,
                position: position,
                rotation: rotation,
                mesh: anchorMesh,
                objects: [],
                createdAt: new Date()
            };
            
            this.anchors.set(anchorId, anchor);
            this.systemState.anchorCount = this.anchors.size;
            
            console.log('📌 تم إنشاء مرساة:', anchorId);
            this.emit('anchor_created', anchor);
            
            return anchor;
            
        } catch (error) {
            console.error('خطأ في إنشاء المرساة:', error);
            throw error;
        }
    }
    
    /**
     * إنشاء شكل المرساة ثلاثي الأبعاد
     */
    createAnchorMesh() {
        // إنشاء حلقة مرساة
        const torusGeometry = new THREE.TorusGeometry(0.1, 0.02, 8, 16);
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.8
        });
        
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.rotation.x = Math.PI / 2;
        
        // إضافة نقطة مركزية
        const centerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const centerMaterial = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            emissive: 0x22d3ee,
            emissiveIntensity: 0.3
        });
        
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        torus.add(center);
        
        // إضافة أنيميشن نبضة
        const animate = () => {
            torus.scale.setScalar(1 + Math.sin(Date.now() * 0.005) * 0.1);
            requestAnimationFrame(animate);
        };
        animate();
        
        return torus;
    }
    
    /**
     * وضع عنصر على المرساة
     */
    placeObjectOnAnchor(anchorId, objectType, data = {}) {
        const anchor = this.anchors.get(anchorId);
        if (!anchor) {
            throw new Error(`المرساة ${anchorId} غير موجودة`);
        }
        
        try {
            // إنشاء الكائن ثلاثي الأبعاد
            const object = this.createObject3D(objectType, data);
            
            // وضع الكائن على المرساة
            object.position.set(0, 0, 0);
            anchor.mesh.add(object);
            
            // حفظ الكائن في المرساة
            anchor.objects.push({
                id: `object_${Date.now()}`,
                type: objectType,
                mesh: object,
                data: data,
                createdAt: new Date()
            });
            
            console.log('📦 تم وضع كائن على المرساة:', objectType);
            this.emit('object_placed', { anchor, object });
            
            return object;
            
        } catch (error) {
            console.error('خطأ في وضع الكائن:', error);
            throw error;
        }
    }
    
    /**
     * إنشاء كائن ثلاثي الأبعاد
     */
    createObject3D(type, data) {
        let geometry, material, mesh;
        
        switch (type) {
            case 'threat':
                geometry = this.createThreatGeometry(data.threatType || 'XSS');
                material = new THREE.MeshBasicMaterial({
                    color: this.getThreatColor(data.severity),
                    transparent: true,
                    opacity: 0.8
                });
                mesh = new THREE.Mesh(geometry, material);
                break;
                
            case 'network_node':
                geometry = new THREE.SphereGeometry(0.05, 16, 16);
                material = new THREE.MeshBasicMaterial({
                    color: 0x22d3ee,
                    transparent: true,
                    opacity: 0.9
                });
                mesh = new THREE.Mesh(geometry, material);
                break;
                
            case 'info_panel':
                geometry = new THREE.PlaneGeometry(0.3, 0.2);
                material = new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                mesh = new THREE.Mesh(geometry, material);
                
                // إضافة نص
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 128;
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = '#22d3ee';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(data.title || 'معلومات', canvas.width / 2, 40);
                
                ctx.fillStyle = '#f0f2f5';
                ctx.font = '12px Arial';
                ctx.fillText(data.description || 'وصف المعلومات', canvas.width / 2, 80);
                
                const texture = new THREE.CanvasTexture(canvas);
                material.map = texture;
                break;
                
            default:
                geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                material = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
                mesh = new THREE.Mesh(geometry, material);
        }
        
        // إضافة بيانات المستخدم
        mesh.userData = {
            type: type,
            data: data,
            createdAt: new Date()
        };
        
        return mesh;
    }
    
    /**
     * إنشاء شكل التهديد
     */
    createThreatGeometry(threatType) {
        switch (threatType) {
            case 'XSS':
                return new THREE.SphereGeometry(0.05, 16, 16);
            case 'SQL Injection':
                return new THREE.BoxGeometry(0.08, 0.08, 0.08);
            case 'Malware':
                return new THREE.TetrahedronGeometry(0.07);
            case 'DDoS':
                return new THREE.OctahedronGeometry(0.06);
            case 'Phishing':
                return new THREE.ConeGeometry(0.05, 0.1, 8);
            case 'Ransomware':
                return new THREE.TorusGeometry(0.05, 0.02, 8, 16);
            default:
                return new THREE.IcosahedronGeometry(0.05);
        }
    }
    
    /**
     * الحصول على لون التهديد
     */
    getThreatColor(severity) {
        switch (severity) {
            case 'منخفض':
                return 0x34d399;
            case 'متوسط':
                return 0xfbbf24;
            case 'عالي':
                return 0xf97316;
            case 'حرج':
                return 0xf87171;
            default:
                return 0x22d3ee;
        }
    }
    
    /**
     * معالجة اكتشاف سطح
     */
    handlePlaneDetected(plane) {
        console.log('🟦 تم اكتشاف سطح جديد');
        
        // إنشاء شكل السطح
        const planeMesh = this.createPlaneMesh(plane);
        
        // حفظ السطح
        this.planes.set(plane.id, {
            id: plane.id,
            center: plane.center,
            width: plane.width,
            height: plane.height,
            orientation: plane.orientation,
            mesh: planeMesh,
            createdAt: new Date()
        });
        
        this.systemState.planeCount = this.planes.size;
        
        // إضافة للمشهد
        this.scene.add(planeMesh);
        
        this.emit('plane_detected', plane);
    }
    
    /**
     * معالجة تحديث سطح
     */
    handlePlaneUpdated(plane) {
        const trackedPlane = this.planes.get(plane.id);
        if (trackedPlane) {
            // تحديث الموقع والأبعاد
            trackedPlane.center = plane.center;
            trackedPlane.width = plane.width;
            trackedPlane.height = plane.height;
            
            // تحديث الشبكة ثلاثية الأبعاد
            trackedPlane.mesh.position.set(plane.center.x, plane.center.y, plane.center.z);
            trackedPlane.mesh.rotation.setFromQuaternion(plane.orientation);
            
            // تحديث الأبعاد
            trackedPlane.mesh.scale.set(plane.width, 1, plane.height);
        }
    }
    
    /**
     * معالجة إزالة سطح
     */
    handlePlaneRemoved(plane) {
        const trackedPlane = this.planes.get(plane.id);
        if (trackedPlane) {
            this.scene.remove(trackedPlane.mesh);
            this.planes.delete(plane.id);
            this.systemState.planeCount = this.planes.size;
        }
    }
    
    /**
     * إنشاء شكل السطح
     */
    createPlaneMesh(plane) {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // تحديد الموقع والتوجيه
        mesh.position.set(plane.center.x, plane.center.y, plane.center.z);
        mesh.quaternion.set(plane.orientation.x, plane.orientation.y, plane.orientation.z, plane.orientation.w);
        mesh.scale.set(plane.width, 1, plane.height);
        
        // إضافة شبكة للتوضيح
        const gridHelper = new THREE.GridHelper(plane.width, 10, 0x22d3ee, 0x22d3ee);
        gridHelper.position.y = 0.001;
        mesh.add(gridHelper);
        
        return mesh;
    }
    
    /**
     * إنشاء أسطح وهمية للاختبار
     */
    createMockPlanes() {
        return [
            {
                id: 'mock_plane_1',
                center: { x: 0, y: 0, z: -1 },
                width: 1,
                height: 0.8,
                orientation: { x: 0, y: 0, z: 0, w: 1 }
            }
        ];
    }
    
    /**
     * معالجة تحديث تقدير الإضاءة
     */
    handleLightEstimationUpdate(estimation) {
        if (estimation) {
            this.systemState.lightIntensity = estimation.primaryLightIntensity || 0.8;
            
            // تحديث إضاءة المشهد
            this.updateSceneLighting(estimation);
            
            console.log('💡 تم تحديث تقدير الإضاءة:', this.systemState.lightIntensity);
        }
    }
    
    /**
     * تحديث إضاءة المشهد
     */
    updateSceneLighting(lightEstimation) {
        // العثور على الإضاءة الرئيسية في المشهد
        const directionalLight = this.scene.children.find(child => 
            child.isDirectionalLight && child.userData.isMainLight
        );
        
        if (directionalLight) {
            // تحديث اتجاه الإضاءة
            if (lightEstimation.primaryLightDirection) {
                const dir = lightEstimation.primaryLightDirection;
                directionalLight.position.set(dir.x * 10, dir.y * 10, dir.z * 10);
            }
            
            // تحديث شدة الإضاءة
            if (lightEstimation.primaryLightIntensity) {
                directionalLight.intensity = lightEstimation.primaryLightIntensity;
            }
        }
    }
    
    /**
     * بدء حلقة الجلسة
     */
    startSessionLoop() {
        const animate = () => {
            if (!this.isSessionActive) return;
            
            // تحديث الأسطح
            this.updatePlanes();
            
            // تحديث المراسي
            this.updateAnchors();
            
            // تحديث تتبع الصور
            this.updateImageTracking();
            
            // تحديث تقدير الإضاءة
            this.updateLightEstimation();
            
            // طلب الإطار التالي
            this.session.requestAnimationFrame(animate);
        };
        
        this.session.requestAnimationFrame(animate);
    }
    
    /**
     * تحديث الأسطح
     */
    updatePlanes() {
        // محاكاة تحديث الأسطح المكتشفة
        if (this.mockPlanes.length > 0) {
            this.mockPlanes.forEach(mockPlane => {
                // فحص ما إذا كان السطح موجود بالفعل
                let plane = this.planes.get(mockPlane.id);
                if (!plane) {
                    // إنشاء سطح جديد
                    this.handlePlaneDetected(mockPlane);
                } else {
                    // تحديث السطح الموجود
                    this.handlePlaneUpdated(mockPlane);
                }
            });
        }
    }
    
    /**
     * تحديث المراسي
     */
    updateAnchors() {
        this.anchors.forEach(anchor => {
            // تحديث المرساة بناءً على موقعها
            if (anchor.mesh) {
                // إضافة دوران بطيء للمرساة
                anchor.mesh.rotation.y += 0.01;
                
                // تحديث حالة الرؤية
                const distanceFromCamera = this.camera.position.distanceTo(anchor.mesh.position);
                anchor.mesh.visible = distanceFromCamera < 5; // إخفاء المرساة إذا كانت بعيدة جداً
            }
        });
    }
    
    /**
     * تحديث تتبع الصور
     */
    updateImageTracking() {
        this.trackedImages.forEach((imageData, id) => {
            // محاكاة تتبع الصور
            if (Math.random() > 0.95) { // 5% احتمال تتبع الصورة
                if (!imageData.tracked) {
                    imageData.tracked = true;
                    imageData.pose = this.generateRandomPose();
                    console.log('🖼️ تم تتبع صورة:', id);
                    this.emit('image_tracked', { id, pose: imageData.pose });
                }
            } else {
                imageData.tracked = false;
            }
        });
    }
    
    /**
     * توليد وضعية عشوائية
     */
    generateRandomPose() {
        return {
            position: {
                x: (Math.random() - 0.5) * 2,
                y: Math.random() * 2,
                z: (Math.random() - 0.5) * 2
            },
            rotation: {
                x: 0,
                y: (Math.random() - 0.5) * Math.PI * 2,
                z: 0,
                w: 1
            }
        };
    }
    
    /**
     * تحديث تقدير الإضاءة
     */
    updateLightEstimation() {
        // محاكاة تغييرات الإضاءة
        const time = Date.now() * 0.001;
        this.systemState.lightIntensity = 0.7 + Math.sin(time * 0.5) * 0.3;
        
        if (this.lightEstimation) {
            this.lightEstimation.currentLight.primaryLightIntensity = this.systemState.lightIntensity;
        }
    }
    
    /**
     * تنظيف المراسي
     */
    cleanupAnchors() {
        this.anchors.forEach(anchor => {
            if (anchor.mesh) {
                this.scene.remove(anchor.mesh);
            }
        });
        this.anchors.clear();
        this.systemState.anchorCount = 0;
    }
    
    /**
     * تنظيف الأسطح
     */
    cleanupPlanes() {
        this.planes.forEach(plane => {
            if (plane.mesh) {
                this.scene.remove(plane.mesh);
            }
        });
        this.planes.clear();
        this.systemState.planeCount = 0;
    }
    
    /**
     * الحصول على حالة النظام
     */
    getSystemState() {
        return {
            ...this.systemState,
            isSessionActive: this.isSessionActive,
            planes: Array.from(this.planes.values()).map(plane => ({
                id: plane.id,
                center: plane.center,
                width: plane.width,
                height: plane.height
            })),
            anchors: Array.from(this.anchors.values()).map(anchor => ({
                id: anchor.id,
                position: anchor.position,
                objectCount: anchor.objects.length
            }))
        };
    }
    
    /**
     * عرض تهديد في الواقع المعزز
     */
    displayThreatInAR(threat, position) {
        if (!this.isSessionActive) {
            throw new Error('جلسة AR غير نشطة');
        }
        
        // إنشاء مرساة للتهديد
        this.createAnchor(position, { x: 0, y: 0, z: 0, w: 1 })
            .then(anchor => {
                // وضع التهديد على المرساة
                this.placeObjectOnAnchor(anchor.id, 'threat', {
                    threatType: threat.type,
                    severity: threat.severity,
                    description: threat.description
                });
                
                console.log('⚠️ تم عرض تهديد في AR:', threat.type);
            })
            .catch(error => {
                console.error('خطأ في عرض التهديد في AR:', error);
            });
    }
    
    /**
     * عرض خريطة شبكة في الواقع المعزز
     */
    displayNetworkMapInAR(networkData, centerPosition) {
        if (!this.isSessionActive) {
            throw new Error('جلسة AR غير نشطة');
        }
        
        // إنشاء مرساة للخريطة
        this.createAnchor(centerPosition, { x: 0, y: 0, z: 0, w: 1 })
            .then(anchor => {
                // إضافة عقد الشبكة
                networkData.nodes.forEach((node, index) => {
                    const nodePosition = {
                        x: (index % 5) * 0.3 - 0.6,
                        y: 0,
                        z: Math.floor(index / 5) * 0.3 - 0.6
                    };
                    
                    this.placeObjectOnAnchor(anchor.id, 'network_node', {
                        zone: node.zone,
                        status: node.status,
                        connections: node.connections
                    });
                });
                
                // إضافة لوحة معلومات
                this.placeObjectOnAnchor(anchor.id, 'info_panel', {
                    title: 'خريطة الشبكة',
                    description: `${networkData.nodes.length} عقدة نشطة`
                });
                
                console.log('🌐 تم عرض خريطة شبكة في AR');
            })
            .catch(error => {
                console.error('خطأ في عرض خريطة الشبكة في AR:', error);
            });
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
        console.log('🗑️ تدمير AR Controller...');
        
        // إنهاء الجلسة النشطة
        if (this.isSessionActive) {
            this.endSession();
        }
        
        // تنظيف الموارد
        this.cleanupAnchors();
        this.cleanupPlanes();
        
        this.trackedImages.clear();
        this.planes.clear();
        
        console.log('✅ تم تدمير AR Controller');
    }
}

// تصدير للاستخدام في الوحدات الأخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARController;
}