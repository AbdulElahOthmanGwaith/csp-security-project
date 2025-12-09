/**
 * 3D Interactive Security Interface
 * Modern 3D visualization and interaction system for security analysis
 * Author: MiniMax Agent
 * Date: 2025-12-10
 */

class Security3DInterface {
    constructor(containerId) {
        this.containerId = containerId;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.securityObjects = new Map();
        this.animationId = null;
        this.isInitialized = false;
        this.userInteractions = [];
        this.securityVisualization = new SecurityVisualization();
        this.gestureRecognizer = new GestureRecognizer();
        this.touchHandler = new TouchHandler();
        this.vrSupported = false;
        this.arSupported = false;
    }

    async initialize() {
        try {
            console.log('🎮 Initializing 3D Security Interface...');
            
            // Check for WebGL support
            if (!this.checkWebGLSupport()) {
                throw new Error('WebGL not supported');
            }
            
            // Initialize Three.js components
            await this.initializeThreeJS();
            
            // Setup 3D security visualization
            await this.setupSecurityVisualization();
            
            // Initialize interaction systems
            this.initializeInteractionSystems();
            
            // Setup gesture recognition
            await this.initializeGestureRecognition();
            
            // Check for VR/AR support
            this.checkXRSupport();
            
            // Start animation loop
            this.startAnimation();
            
            this.isInitialized = true;
            console.log('✅ 3D Security Interface initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize 3D Interface:', error);
            this.fallbackTo2D();
        }
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }

    async initializeThreeJS() {
        // Import Three.js dynamically
        if (typeof THREE === 'undefined') {
            await this.loadThreeJS();
        }
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add renderer to container
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container with id ${this.containerId} not found`);
        }
        container.appendChild(this.renderer.domElement);
        
        // Initialize controls
        this.initializeControls();
        
        // Setup lighting
        this.setupLighting();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    async loadThreeJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    initializeControls() {
        // Simple orbit controls implementation
        this.controls = {
            target: new THREE.Vector3(0, 0, 0),
            spherical: new THREE.Spherical(),
            rotateSpeed: 0.1,
            zoomSpeed: 1.2,
            panSpeed: 0.8,
            
            update: () => {
                this.camera.lookAt(this.controls.target);
            },
            
            rotate: (deltaX, deltaY) => {
                this.spherical.theta -= deltaX * this.controls.rotateSpeed;
                this.spherical.phi += deltaY * this.controls.rotateSpeed;
                this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi));
                
                const pos = new THREE.Vector3().setFromSpherical(this.spherical);
                this.camera.position.copy(pos);
            },
            
            zoom: (delta) => {
                const distance = this.camera.position.distanceTo(this.controls.target);
                const newDistance = distance * (1 + delta * this.controls.zoomSpeed);
                this.camera.position.setLength(newDistance);
            },
            
            pan: (deltaX, deltaY) => {
                const moveVector = new THREE.Vector3();
                const cameraDistance = this.camera.position.distanceTo(this.controls.target);
                
                // Calculate movement in camera space
                moveVector.set(-deltaX * cameraDistance * 0.001, deltaY * cameraDistance * 0.001, 0);
                moveVector.applyQuaternion(this.camera.quaternion);
                
                this.controls.target.add(moveVector);
            }
        };
        
        this.controls.spherical.setFromVector3(this.camera.position.clone().sub(this.controls.target));
        
        // Mouse event handlers
        this.setupMouseControls();
    }

    setupMouseControls() {
        const canvas = this.renderer.domElement;
        let isMouseDown = false;
        let mouseStart = { x: 0, y: 0 };
        let lastMouse = { x: 0, y: 0 };
        
        canvas.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mouseStart = { x: e.clientX, y: e.clientY };
            lastMouse = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            
            const deltaX = e.clientX - lastMouse.x;
            const deltaY = e.clientY - lastMouse.y;
            
            if (e.buttons === 1) { // Left click - rotate
                this.controls.rotate(deltaX, deltaY);
            } else if (e.buttons === 2) { // Right click - pan
                this.controls.pan(deltaX, deltaY);
            }
            
            lastMouse = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.controls.zoom(e.deltaY > 0 ? 1 : -1);
        });
        
        // Prevent context menu
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        canvas.style.cursor = 'grab';
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0x00e0d5, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point lights for accent
        const pointLight1 = new THREE.PointLight(0x00e0d5, 0.5, 10);
        pointLight1.position.set(-5, 5, 5);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff6b6b, 0.3, 8);
        pointLight2.position.set(5, -3, -5);
        this.scene.add(pointLight2);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(-10, -10, -5);
        this.scene.add(rimLight);
    }

    async setupSecurityVisualization() {
        // Create security dashboard in 3D space
        this.createSecurityDashboard();
        
        // Create threat visualization
        this.createThreatVisualization();
        
        // Create network visualization
        this.createNetworkVisualization();
        
        // Create performance metrics visualization
        this.createPerformanceVisualization();
    }

    createSecurityDashboard() {
        // Main dashboard panel
        const dashboardGeometry = new THREE.PlaneGeometry(8, 4);
        const dashboardMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a1a1a,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const dashboard = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
        dashboard.position.set(0, 0, -5);
        dashboard.castShadow = true;
        dashboard.receiveShadow = true;
        this.scene.add(dashboard);
        
        // Dashboard frame
        const frameGeometry = new THREE.RingGeometry(4.2, 4.3, 32);
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: 0x00e0d5,
            transparent: true,
            opacity: 0.6
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.copy(dashboard.position);
        this.scene.add(frame);
        
        // Store dashboard reference
        this.securityObjects.set('dashboard', dashboard);
        
        // Add animated border
        this.createAnimatedBorder(frame);
    }

    createThreatVisualization() {
        // Create threat indicators as floating spheres
        const threatTypes = [
            { type: 'XSS', color: 0xff6b6b, position: { x: -2, y: 1, z: -3 } },
            { type: 'SQL Injection', color: 0xffa500, position: { x: 0, y: 1, z: -3 } },
            { type: 'CSRF', color: 0xffff00, position: { x: 2, y: 1, z: -3 } },
            { type: 'Clickjacking', color: 0x9d4edd, position: { x: -1, y: -1, z: -3 } },
            { type: 'RCE', color: 0xff0000, position: { x: 1, y: -1, z: -3 } }
        ];
        
        threatTypes.forEach(threat => {
            const sphere = this.createThreatSphere(threat);
            this.scene.add(sphere);
            this.securityObjects.set(`threat_${threat.type}`, sphere);
        });
    }

    createThreatSphere(threat) {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        
        // Create animated material
        const material = new THREE.MeshPhongMaterial({
            color: threat.color,
            transparent: true,
            opacity: 0.8,
            emissive: threat.color,
            emissiveIntensity: 0.2
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(threat.position.x, threat.position.y, threat.position.z);
        sphere.castShadow = true;
        
        // Add pulsing animation
        sphere.userData = {
            type: 'threat_indicator',
            threatType: threat.type,
            baseScale: 1,
            pulseSpeed: 2 + Math.random() * 2,
            originalColor: threat.color
        };
        
        return sphere;
    }

    createNetworkVisualization() {
        // Create network nodes
        const nodes = [];
        const connections = [];
        
        // Generate network topology
        const nodeCount = 12;
        for (let i = 0; i < nodeCount; i++) {
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = 3;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Math.sin(angle * 3) * 1; // Add some height variation
            
            const node = this.createNetworkNode(new THREE.Vector3(x, y, z), i);
            nodes.push(node);
            this.scene.add(node);
            
            // Create connections to nearby nodes
            for (let j = i + 1; j < Math.min(i + 4, nodeCount); j++) {
                const targetAngle = (j / nodeCount) * Math.PI * 2;
                const targetX = Math.cos(targetAngle) * radius;
                const targetZ = Math.sin(targetAngle) * radius;
                const targetY = Math.sin(targetAngle * 3) * 1;
                
                const connection = this.createNetworkConnection(
                    node.position,
                    new THREE.Vector3(targetX, targetY, targetZ)
                );
                connections.push(connection);
                this.scene.add(connection);
            }
        }
        
        this.securityObjects.set('network_nodes', nodes);
        this.securityObjects.set('network_connections', connections);
    }

    createNetworkNode(position, index) {
        const geometry = new THREE.OctahedronGeometry(0.1, 0);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00e0d5,
            transparent: true,
            opacity: 0.7,
            emissive: 0x00e0d5,
            emissiveIntensity: 0.3
        });
        
        const node = new THREE.Mesh(geometry, material);
        node.position.copy(position);
        node.castShadow = true;
        
        // Add particle effect
        const particles = this.createParticleEffect(position, 0x00e0d5);
        this.scene.add(particles);
        
        node.userData = {
            type: 'network_node',
            nodeId: index,
            connections: 0
        };
        
        return node;
    }

    createNetworkConnection(start, end) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            start.x, start.y, start.z,
            end.x, end.y, end.z
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: 0x00e0d5,
            transparent: true,
            opacity: 0.4
        });
        
        const line = new THREE.Line(geometry, material);
        line.userData = {
            type: 'network_connection',
            start: start,
            end: end,
            active: true
        };
        
        return line;
    }

    createPerformanceVisualization() {
        // Create performance charts as 3D bars
        const metrics = [
            { name: 'CPU Usage', value: 45, color: 0x00e0d5 },
            { name: 'Memory', value: 68, color: 0x9d4edd },
            { name: 'Network', value: 32, color: 0xff6b6b },
            { name: 'Disk I/O', value: 23, color: 0xffa500 }
        ];
        
        metrics.forEach((metric, index) => {
            const bar = this.createPerformanceBar(metric, index);
            this.scene.add(bar);
            this.securityObjects.set(`perf_${metric.name}`, bar);
        });
    }

    createPerformanceBar(metric, index) {
        const height = (metric.value / 100) * 3; // Scale to 3 units max
        const geometry = new THREE.BoxGeometry(0.3, height, 0.3);
        
        const material = new THREE.MeshPhongMaterial({
            color: metric.color,
            transparent: true,
            opacity: 0.8,
            emissive: metric.color,
            emissiveIntensity: 0.2
        });
        
        const bar = new THREE.Mesh(geometry, material);
        bar.position.set(-3 + index * 2, height / 2 - 2, 2);
        bar.castShadow = true;
        
        bar.userData = {
            type: 'performance_bar',
            metric: metric.name,
            value: metric.value,
            originalHeight: height
        };
        
        return bar;
    }

    createParticleEffect(position, color) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2;
            positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;
            
            colors[i * 3] = (color >> 16 & 255) / 255;
            colors[i * 3 + 1] = (color >> 8 & 255) / 255;
            colors[i * 3 + 2] = (color & 255) / 255;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData = {
            type: 'particle_effect',
            positions: positions,
            originalPositions: positions.slice(),
            time: 0
        };
        
        return particles;
    }

    createAnimatedBorder(frame) {
        // Create animated border effect
        const borderPoints = [];
        const segments = 64;
        const radius = 4.25;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            borderPoints.push(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(borderPoints, 3));
        
        const material = new THREE.LineBasicMaterial({
            color: 0x00e0d5,
            transparent: true,
            opacity: 0.8
        });
        
        const border = new THREE.Line(geometry, material);
        frame.add(border);
        
        frame.userData = {
            type: 'animated_border',
            time: 0,
            segments: segments
        };
    }

    initializeInteractionSystems() {
        // Setup raycaster for object picking
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Setup click handlers
        this.renderer.domElement.addEventListener('click', (e) => this.handleClick(e));
        
        // Setup hover handlers
        this.renderer.domElement.addEventListener('mousemove', (e) => this.handleHover(e));
        
        // Initialize touch handlers
        this.touchHandler.initialize(this.renderer.domElement);
    }

    async initializeGestureRecognition() {
        try {
            // Setup gesture recognition for touch devices
            await this.gestureRecognizer.initialize();
            this.gestureRecognizer.onGesture((gesture) => this.handleGesture(gesture));
        } catch (error) {
            console.warn('Gesture recognition not available:', error);
        }
    }

    checkXRSupport() {
        // Check for VR support
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
                this.vrSupported = supported;
                if (supported) {
                    console.log('🥽 VR support detected');
                }
            });
        }
        
        // Check for AR support
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
                this.arSupported = supported;
                if (supported) {
                    console.log('📱 AR support detected');
                }
            });
        }
    }

    handleClick(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get intersections
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            this.onObjectClick(intersected, intersects[0]);
        }
    }

    handleHover(event) {
        // Calculate mouse position
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get intersections
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        // Reset all object materials
        this.scene.children.forEach(obj => {
            if (obj.material && obj.material.emissive) {
                obj.material.emissive.setHex(obj.userData.originalColor || 0x000000);
            }
        });
        
        // Highlight hovered object
        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            if (intersected.material && intersected.material.emissive) {
                intersected.material.emissive.setHex(0xffffff);
                intersected.material.emissiveIntensity = 0.5;
            }
        }
    }

    onObjectClick(object, intersection) {
        const userData = object.userData;
        
        switch (userData.type) {
            case 'threat_indicator':
                this.showThreatDetails(userData.threatType);
                break;
                
            case 'network_node':
                this.highlightNetworkConnections(userData.nodeId);
                break;
                
            case 'performance_bar':
                this.showPerformanceDetails(userData.metric);
                break;
                
            case 'dashboard':
                this.interactWithDashboard(intersection.point);
                break;
        }
        
        // Add click effect
        this.createClickEffect(intersection.point);
        
        // Log interaction
        this.userInteractions.push({
            type: 'click',
            object: userData.type,
            position: intersection.point.clone(),
            timestamp: Date.now()
        });
    }

    handleGesture(gesture) {
        switch (gesture.type) {
            case 'swipe_left':
                this.rotateView(0.5, 0);
                break;
            case 'swipe_right':
                this.rotateView(-0.5, 0);
                break;
            case 'swipe_up':
                this.zoomView(1);
                break;
            case 'swipe_down':
                this.zoomView(-1);
                break;
            case 'pinch':
                this.zoomView(gesture.scale > 1 ? 1 : -1);
                break;
        }
    }

    showThreatDetails(threatType) {
        // Create floating info panel
        const infoPanel = this.createInfoPanel(threatType);
        this.scene.add(infoPanel);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.scene.remove(infoPanel);
        }, 5000);
    }

    createInfoPanel(threatType) {
        const panelGeometry = new THREE.PlaneGeometry(2, 1);
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Draw threat information
        context.fillStyle = '#1a1a1a';
        context.fillRect(0, 0, 512, 256);
        context.strokeStyle = '#00e0d5';
        context.lineWidth = 4;
        context.strokeRect(0, 0, 512, 256);
        
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.fillText(`Threat: ${threatType}`, 20, 40);
        context.font = '16px Arial';
        context.fillText('Severity: High', 20, 80);
        context.fillText('Status: Active Monitoring', 20, 110);
        context.fillText('Recommendations Available', 20, 140);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        
        const panel = new THREE.Mesh(panelGeometry, material);
        panel.position.set(0, 0, -2);
        
        return panel;
    }

    createClickEffect(position) {
        // Create expanding ring effect
        const ringGeometry = new THREE.RingGeometry(0, 0.5, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00e0d5,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.userData = {
            type: 'click_effect',
            startTime: Date.now(),
            duration: 1000
        };
        
        this.scene.add(ring);
        
        // Remove effect after animation
        setTimeout(() => {
            this.scene.remove(ring);
        }, 1000);
    }

    rotateView(deltaX, deltaY) {
        this.controls.rotate(deltaX * 50, deltaY * 50);
    }

    zoomView(delta) {
        this.controls.zoom(delta);
    }

    startAnimation() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            // Update controls
            this.controls.update();
            
            // Animate objects
            this.animateSecurityObjects();
            
            // Update particle effects
            this.updateParticleEffects();
            
            // Update click effects
            this.updateClickEffects();
            
            // Render scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }

    animateSecurityObjects() {
        const time = Date.now() * 0.001;
        
        this.scene.children.forEach(object => {
            const userData = object.userData;
            
            if (!userData) return;
            
            switch (userData.type) {
                case 'threat_indicator':
                    // Pulse animation
                    const pulseScale = 1 + Math.sin(time * userData.pulseSpeed) * 0.2;
                    object.scale.setScalar(userData.baseScale * pulseScale);
                    
                    // Rotate slowly
                    object.rotation.y += 0.01;
                    break;
                    
                case 'performance_bar':
                    // Animate height based on value
                    const targetHeight = (userData.value / 100) * 3;
                    const currentHeight = object.geometry.parameters.height;
                    const newHeight = currentHeight + (targetHeight - currentHeight) * 0.1;
                    
                    object.scale.y = newHeight / userData.originalHeight;
                    object.position.y = newHeight / 2 - 2;
                    break;
                    
                case 'animated_border':
                    // Rotate border
                    object.rotation.z = time * 0.5;
                    break;
            }
        });
    }

    updateParticleEffects() {
        const time = Date.now() * 0.001;
        
        this.scene.children.forEach(object => {
            if (object.userData.type === 'particle_effect') {
                const positions = object.geometry.attributes.position.array;
                const originalPositions = object.userData.originalPositions;
                
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] = originalPositions[i] + Math.sin(time + i) * 0.1;
                    positions[i + 1] = originalPositions[i + 1] + Math.cos(time + i) * 0.1;
                    positions[i + 2] = originalPositions[i + 2] + Math.sin(time * 2 + i) * 0.05;
                }
                
                object.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    updateClickEffects() {
        const now = Date.now();
        const effectsToRemove = [];
        
        this.scene.children.forEach(object => {
            if (object.userData.type === 'click_effect') {
                const elapsed = now - object.userData.startTime;
                const progress = elapsed / object.userData.duration;
                
                if (progress >= 1) {
                    effectsToRemove.push(object);
                } else {
                    const scale = progress * 3;
                    object.scale.setScalar(scale);
                    object.material.opacity = 0.8 * (1 - progress);
                }
            }
        });
        
        effectsToRemove.forEach(effect => {
            this.scene.remove(effect);
        });
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    fallbackTo2D() {
        console.log('⚠️ Falling back to 2D interface');
        // Create simplified 2D version
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = `
                <div style="
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #00e0d5;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                ">
                    <div style="text-align: center;">
                        <h2>🔒 3D Security Interface</h2>
                        <p>Your browser doesn't support WebGL</p>
                        <p>Using enhanced 2D interface</p>
                    </div>
                </div>
            `;
        }
    }

    // Public API methods
    updateThreatStatus(threatType, status) {
        const threatObject = this.securityObjects.get(`threat_${threatType}`);
        if (threatObject) {
            const intensity = status === 'active' ? 0.8 : 0.3;
            threatObject.material.opacity = intensity;
            threatObject.material.emissiveIntensity = intensity * 0.5;
        }
    }

    updatePerformanceMetric(metricName, value) {
        const perfObject = this.securityObjects.get(`perf_${metricName}`);
        if (perfObject) {
            perfObject.userData.value = value;
        }
    }

    highlightNetworkAnomaly(nodeId) {
        const nodes = this.securityObjects.get('network_nodes');
        if (nodes && nodes[nodeId]) {
            const node = nodes[nodeId];
            node.material.color.setHex(0xff0000);
            node.material.emissive.setHex(0xff0000);
            node.material.emissiveIntensity = 0.5;
            
            // Reset after 3 seconds
            setTimeout(() => {
                node.material.color.setHex(0x00e0d5);
                node.material.emissive.setHex(0x00e0d5);
                node.material.emissiveIntensity = 0.3;
            }, 3000);
        }
    }

    getUserInteractions() {
        return this.userInteractions;
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.controls) {
            // Clean up controls
        }
    }
}

/**
 * Gesture Recognition System
 */
class GestureRecognizer {
    constructor() {
        this.touches = [];
        this.gestures = [];
        this.initialized = false;
    }

    async initialize() {
        console.log('👋 Initializing gesture recognition...');
        this.initialized = true;
    }

    onGesture(callback) {
        this.gestureCallback = callback;
    }

    addTouch(touch) {
        this.touches.push(touch);
        this.detectGestures();
    }

    removeTouch(touchId) {
        this.touches = this.touches.filter(t => t.id !== touchId);
    }

    detectGestures() {
        if (this.touches.length === 1) {
            // Single touch gestures
        } else if (this.touches.length === 2) {
            // Pinch gesture
            this.detectPinch();
        }
    }

    detectPinch() {
        if (this.touches.length === 2) {
            const touch1 = this.touches[0];
            const touch2 = this.touches[1];
            const distance = Math.sqrt(
                Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
            );
            
            if (this.lastPinchDistance) {
                const scale = distance / this.lastPinchDistance;
                if (Math.abs(scale - 1) > 0.1) {
                    this.gestureCallback({
                        type: 'pinch',
                        scale: scale,
                        timestamp: Date.now()
                    });
                }
            }
            
            this.lastPinchDistance = distance;
        }
    }
}

/**
 * Touch Handler
 */
class TouchHandler {
    constructor() {
        this.touches = new Map();
    }

    initialize(element) {
        element.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        element.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        element.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    handleTouchStart(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            this.touches.set(touch.identifier, {
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY
            });
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (this.touches.has(touch.identifier)) {
                const stored = this.touches.get(touch.identifier);
                stored.x = touch.clientX;
                stored.y = touch.clientY;
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            this.touches.delete(touch.identifier);
        }
    }
}

/**
 * Security Visualization Helper
 */
class SecurityVisualization {
    createThreatVisualization(threatData) {
        // Create threat visualization based on data
        return {
            threats: threatData,
            visualization: '3d_sphere',
            animation: 'pulse'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        Security3DInterface, 
        GestureRecognizer, 
        TouchHandler, 
        SecurityVisualization 
    };
}