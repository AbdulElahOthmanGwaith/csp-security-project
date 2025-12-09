/**
 * Service Worker Manager
 * Advanced offline functionality and data persistence for security platform
 * Author: MiniMax Agent
 * Date: 2025-12-10
 */

class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.isSupported = 'serviceWorker' in navigator;
        this.cacheNames = {
            static: 'security-platform-static-v1',
            dynamic: 'security-platform-dynamic-v1',
            api: 'security-platform-api-v1',
            analysis: 'security-platform-analysis-v1',
            training: 'security-platform-training-v1'
        };
        this.syncQueue = [];
        this.offlineData = new Map();
        this.backgroundSync = false;
        this.pushNotifications = false;
        this.installPrompt = null;
    }

    async initialize() {
        try {
            if (!this.isSupported) {
                throw new Error('Service Workers not supported');
            }

            console.log('🌐 Initializing Service Worker Manager...');

            // Register service worker
            await this.registerServiceWorker();

            // Setup offline functionality
            await this.setupOfflineCapabilities();

            // Initialize background sync
            await this.setupBackgroundSync();

            // Setup push notifications
            await this.setupPushNotifications();

            // Setup data persistence
            await this.setupDataPersistence();

            // Setup install prompt
            this.setupInstallPrompt();

            console.log('✅ Service Worker Manager initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize Service Worker:', error);
            this.fallbackToLocalStorage();
        }
    }

    async registerServiceWorker() {
        try {
            // Create service worker content
            const swContent = this.generateServiceWorkerContent();
            const swBlob = new Blob([swContent], { type: 'application/javascript' });
            const swUrl = URL.createObjectURL(swBlob);

            this.registration = await navigator.serviceWorker.register(swUrl, {
                scope: './'
            });

            console.log('✅ Service Worker registered:', this.registration.scope);

            // Handle service worker updates
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateAvailable();
                    }
                });
            });

        } catch (error) {
            console.error('Service Worker registration failed:', error);
            throw error;
        }
    }

    generateServiceWorkerContent() {
        return `
            const CACHE_NAMES = {
                static: 'security-platform-static-v1',
                dynamic: 'security-platform-dynamic-v1',
                api: 'security-platform-api-v1',
                analysis: 'security-platform-analysis-v1',
                training: 'security-platform-training-v1'
            };

            const STATIC_ASSETS = [
                './',
                './index.html',
                './advanced-security-platform.html',
                './styles/main.css',
                './styles/dark-theme.css',
                './js/ai-threat-analyzer.js',
                './js/real-time-monitor.js',
                './js/smart-policy-generator.js',
                './js/security-training.js',
                './js/security-dashboard.js',
                './js/wasm-security-analyzer.js',
                './js/ai-behavioral-analyzer.js',
                './js/3d-interactive-interface.js'
            ];

            // Install event - cache static assets
            self.addEventListener('install', event => {
                console.log('🔧 Service Worker installing...');
                event.waitUntil(
                    caches.open(CACHE_NAMES.static)
                        .then(cache => {
                            console.log('📦 Caching static assets');
                            return cache.addAll(STATIC_ASSETS);
                        })
                        .then(() => self.skipWaiting())
                );
            });

            // Activate event - cleanup old caches
            self.addEventListener('activate', event => {
                console.log('🚀 Service Worker activating...');
                event.waitUntil(
                    caches.keys()
                        .then(cacheNames => {
                            return Promise.all(
                                cacheNames.map(cacheName => {
                                    if (!Object.values(CACHE_NAMES).includes(cacheName)) {
                                        console.log('🗑️ Deleting old cache:', cacheName);
                                        return caches.delete(cacheName);
                                    }
                                })
                            );
                        })
                        .then(() => self.clients.claim())
                );
            });

            // Fetch event - serve from cache with network fallback
            self.addEventListener('fetch', event => {
                const { request } = event;
                const url = new URL(request.url);

                // Handle different types of requests
                if (request.method === 'GET') {
                    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
                        // Cache static assets with stale-while-revalidate
                        event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.static));
                    } else if (url.pathname.includes('/api/')) {
                        // Cache API responses with network-first
                        event.respondWith(networkFirst(request, CACHE_NAMES.api));
                    } else if (url.pathname.includes('/analysis/')) {
                        // Cache analysis data with cache-first
                        event.respondWith(cacheFirst(request, CACHE_NAMES.analysis));
                    } else {
                        // Default: network-first with cache fallback
                        event.respondWith(networkFirst(request, CACHE_NAMES.dynamic));
                    }
                } else if (request.method === 'POST') {
                    // Queue POST requests for background sync
                    event.respondWith(handlePostRequest(request));
                }
            });

            // Background sync event
            self.addEventListener('sync', event => {
                console.log('🔄 Background sync triggered:', event.tag);
                if (event.tag === 'security-analysis-sync') {
                    event.waitUntil(syncSecurityData());
                }
            });

            // Push notification event
            self.addEventListener('push', event => {
                console.log('📱 Push notification received');
                const options = {
                    body: event.data ? event.data.text() : 'New security alert',
                    icon: '/icon-192x192.png',
                    badge: '/badge-72x72.png',
                    tag: 'security-alert',
                    requireInteraction: true,
                    actions: [
                        {
                            action: 'view',
                            title: 'View Details'
                        },
                        {
                            action: 'dismiss',
                            title: 'Dismiss'
                        }
                    ]
                };

                event.waitUntil(
                    self.registration.showNotification('Security Alert', options)
                );
            });

            // Notification click event
            self.addEventListener('notificationclick', event => {
                console.log('👆 Notification clicked:', event.action);
                event.notification.close();

                if (event.action === 'view') {
                    event.waitUntil(
                        clients.openWindow('/security-dashboard')
                    );
                }
            });

            // Cache strategies
            async function staleWhileRevalidate(request, cacheName) {
                const cache = await caches.open(cacheName);
                const cachedResponse = await cache.match(request);
                
                const networkPromise = fetch(request).then(response => {
                    cache.put(request, response.clone());
                    return response;
                }).catch(() => cachedResponse);
                
                return cachedResponse || networkPromise;
            }

            async function networkFirst(request, cacheName) {
                const cache = await caches.open(cacheName);
                try {
                    const response = await fetch(request);
                    cache.put(request, response.clone());
                    return response;
                } catch (error) {
                    const cachedResponse = await cache.match(request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    throw error;
                }
            }

            async function cacheFirst(request, cacheName) {
                const cache = await caches.open(cacheName);
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                const response = await fetch(request);
                cache.put(request, response.clone());
                return response;
            }

            async function handlePostRequest(request) {
                try {
                    const response = await fetch(request.clone());
                    return response;
                } catch (error) {
                    // Store failed request for retry
                    const requestData = {
                        url: request.url,
                        method: request.method,
                        headers: Object.fromEntries(request.headers.entries()),
                        body: await request.text(),
                        timestamp: Date.now()
                    };
                    
                    await storeFailedRequest(requestData);
                    
                    // Return success response to prevent app from breaking
                    return new Response(JSON.stringify({
                        status: 'queued',
                        message: 'Request queued for background sync'
                    }), {
                        status: 202,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }

            async function storeFailedRequest(requestData) {
                const db = await openDB();
                const transaction = db.transaction(['requests'], 'readwrite');
                const store = transaction.objectStore('requests');
                await store.add(requestData);
            }

            async function syncSecurityData() {
                const db = await openDB();
                const transaction = db.transaction(['requests'], 'readonly');
                const store = transaction.objectStore('requests');
                const requests = await store.getAll();
                
                for (const requestData of requests) {
                    try {
                        await fetch(requestData.url, {
                            method: requestData.method,
                            headers: requestData.headers,
                            body: requestData.body
                        });
                        
                        // Remove successfully synced request
                        const deleteTransaction = db.transaction(['requests'], 'readwrite');
                        const deleteStore = deleteTransaction.objectStore('requests');
                        await deleteStore.delete(requestData.timestamp);
                        
                    } catch (error) {
                        console.log('Sync failed for request:', requestData.url);
                    }
                }
            }

            // IndexedDB helper
            function openDB() {
                return new Promise((resolve, reject) => {
                    const request = indexedDB.open('SecurityPlatformDB', 1);
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(request.result);
                    request.onupgradeneeded = (event) => {
                        const db = event.target.result;
                        if (!db.objectStoreNames.contains('requests')) {
                            db.createObjectStore('requests', { keyPath: 'timestamp' });
                        }
                        if (!db.objectStoreNames.contains('analysis')) {
                            db.createObjectStore('analysis', { keyPath: 'id' });
                        }
                        if (!db.objectStoreNames.contains('training')) {
                            db.createObjectStore('training', { keyPath: 'id' });
                        }
                    };
                });
            }

            console.log('🛡️ Service Worker loaded and ready');
        `;
    }

    async setupOfflineCapabilities() {
        // Pre-cache critical resources
        await this.preCacheResources();

        // Setup offline detection
        this.setupOfflineDetection();

        // Setup data synchronization
        this.setupDataSynchronization();
    }

    async preCacheResources() {
        if ('caches' in window) {
            try {
                const cache = await caches.open(this.cacheNames.static);
                const criticalResources = [
                    './',
                    './advanced-security-platform.html',
                    './styles/main.css',
                    './js/ai-threat-analyzer.js',
                    './js/real-time-monitor.js',
                    './js/security-dashboard.js'
                ];

                await cache.addAll(criticalResources);
                console.log('📦 Critical resources cached for offline use');

            } catch (error) {
                console.warn('Failed to pre-cache resources:', error);
            }
        }
    }

    setupOfflineDetection() {
        window.addEventListener('online', () => {
            console.log('🌐 Back online - syncing data');
            this.syncQueuedData();
            this.showOnlineStatus();
        });

        window.addEventListener('offline', () => {
            console.log('📱 Gone offline - enabling offline mode');
            this.showOfflineStatus();
        });

        // Initial status check
        if (!navigator.onLine) {
            this.showOfflineStatus();
        }
    }

    async setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            try {
                // Register background sync
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('security-analysis-sync');
                this.backgroundSync = true;
                console.log('🔄 Background sync enabled');

            } catch (error) {
                console.warn('Background sync not available:', error);
            }
        } else {
            console.log('⚠️ Background sync not supported');
        }
    }

    async setupPushNotifications() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: this.urlBase64ToUint8Array(this.generateVapidKey())
                    });
                    
                    this.pushNotifications = true;
                    console.log('📱 Push notifications enabled');
                    
                    // Store subscription for later use
                    await this.storePushSubscription(subscription);
                }
            } catch (error) {
                console.warn('Push notifications not available:', error);
            }
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }

    generateVapidKey() {
        // In production, use actual VAPID keys
        return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NQD9Fk4bQGjPU6u8F6c-cl9KCdCq3r5v5n8g5n3k2_3k1J7N5K2P5K3L8K9';
    }

    async storePushSubscription(subscription) {
        // Store subscription in IndexedDB or send to server
        try {
            const db = await this.openIndexedDB();
            const transaction = db.transaction(['subscriptions'], 'readwrite');
            const store = transaction.objectStore('subscriptions');
            await store.put({
                id: 'main',
                subscription: subscription,
                timestamp: Date.now()
            });
            console.log('📱 Push subscription stored');
        } catch (error) {
            console.warn('Failed to store push subscription:', error);
        }
    }

    async setupDataPersistence() {
        // Setup IndexedDB for large data storage
        this.db = await this.openIndexedDB();
        
        // Setup data cleanup
        this.scheduleDataCleanup();
    }

    async openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SecurityPlatformDB', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('analysis')) {
                    db.createObjectStore('analysis', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('training')) {
                    db.createObjectStore('training', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('threats')) {
                    db.createObjectStore('threats', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('logs')) {
                    db.createObjectStore('logs', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('subscriptions')) {
                    db.createObjectStore('subscriptions', { keyPath: 'id' });
                }
            };
        });
    }

    setupInstallPrompt() {
        let deferredPrompt = null;

        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('💾 PWA install prompt available');
            e.preventDefault();
            deferredPrompt = e;
            this.installPrompt = e;
            
            // Show custom install button
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('📱 PWA installed successfully');
            deferredPrompt = null;
            this.hideInstallButton();
        });
    }

    showInstallButton() {
        // Create and show install button
        const installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.innerHTML = '📱 تثبيت التطبيق';
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #00e0d5;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 224, 213, 0.3);
            z-index: 1000;
            transition: all 0.3s ease;
        `;

        installButton.addEventListener('click', async () => {
            if (this.installPrompt) {
                this.installPrompt.prompt();
                const { outcome } = await this.installPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('✅ PWA installation accepted');
                } else {
                    console.log('❌ PWA installation dismissed');
                }
                
                this.installPrompt = null;
                this.hideInstallButton();
            }
        });

        document.body.appendChild(installButton);
    }

    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.remove();
        }
    }

    showOnlineStatus() {
        this.showStatusMessage('🌐 الاتصال restored', 'success');
    }

    showOfflineStatus() {
        this.showStatusMessage('📱 يعمل دون اتصال', 'warning');
    }

    showStatusMessage(message, type) {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#4CAF50' : '#FF9800'};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1001;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(statusDiv);

        setTimeout(() => {
            statusDiv.remove();
        }, 3000);
    }

    showUpdateAvailable() {
        const updateDiv = document.createElement('div');
        updateDiv.innerHTML = `
            <div style="background: #2196F3; color: white; padding: 15px; text-align: center; position: fixed; top: 0; left: 0; right: 0; z-index: 1002;">
                <strong>🚀 تحديث جديد متوفر</strong>
                <button onclick="window.location.reload()" style="margin-left: 10px; padding: 5px 15px; background: white; color: #2196F3; border: none; border-radius: 3px; cursor: pointer;">تحديث الآن</button>
            </div>
        `;
        document.body.appendChild(updateDiv);
    }

    // Data management methods
    async storeAnalysisData(data) {
        try {
            const transaction = this.db.transaction(['analysis'], 'readwrite');
            const store = transaction.objectStore('analysis');
            
            const analysisRecord = {
                id: 'analysis_' + Date.now(),
                data: data,
                timestamp: Date.now(),
                synced: false
            };
            
            await store.add(analysisRecord);
            this.offlineData.set(analysisRecord.id, analysisRecord);
            
            console.log('💾 Analysis data stored offline');
            
        } catch (error) {
            console.error('Failed to store analysis data:', error);
        }
    }

    async getAnalysisData() {
        try {
            const transaction = this.db.transaction(['analysis'], 'readonly');
            const store = transaction.objectStore('analysis');
            const data = await store.getAll();
            
            return data.map(record => record.data);
            
        } catch (error) {
            console.error('Failed to retrieve analysis data:', error);
            return [];
        }
    }

    async storeTrainingProgress(progress) {
        try {
            const transaction = this.db.transaction(['training'], 'readwrite');
            const store = transaction.objectStore('training');
            
            const progressRecord = {
                id: 'progress_' + Date.now(),
                progress: progress,
                timestamp: Date.now(),
                synced: false
            };
            
            await store.add(progressRecord);
            this.syncQueue.push(progressRecord);
            
            console.log('📚 Training progress stored offline');
            
        } catch (error) {
            console.error('Failed to store training progress:', error);
        }
    }

    async syncQueuedData() {
        if (!navigator.onLine || this.syncQueue.length === 0) {
            return;
        }

        console.log('🔄 Syncing queued data...');

        for (const item of this.syncQueue) {
            try {
                // Simulate sync operation
                await this.syncItem(item);
                console.log('✅ Synced item:', item.id);
            } catch (error) {
                console.error('Failed to sync item:', item.id, error);
            }
        }

        this.syncQueue = [];
    }

    async syncItem(item) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    }

    setupDataSynchronization() {
        // Auto-sync every 5 minutes when online
        setInterval(() => {
            if (navigator.onLine) {
                this.syncQueuedData();
            }
        }, 5 * 60 * 1000);
    }

    scheduleDataCleanup() {
        // Clean up old data every hour
        setInterval(() => {
            this.cleanupOldData();
        }, 60 * 60 * 1000);
    }

    async cleanupOldData() {
        try {
            const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
            
            const stores = ['analysis', 'training', 'logs'];
            
            for (const storeName of stores) {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const data = await store.getAll();
                
                for (const item of data) {
                    if (item.timestamp < cutoffTime) {
                        await store.delete(item.id);
                    }
                }
            }
            
            console.log('🧹 Old data cleaned up');
            
        } catch (error) {
            console.error('Failed to cleanup old data:', error);
        }
    }

    fallbackToLocalStorage() {
        console.log('⚠️ Using localStorage fallback');
        
        // Use localStorage for basic persistence
        this.storeInLocalStorage = (key, data) => {
            localStorage.setItem(key, JSON.stringify(data));
        };
        
        this.getFromLocalStorage = (key) => {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        };
    }

    // Public API methods
    async sendNotification(title, body, actions = []) {
        if (!this.pushNotifications) {
            console.warn('Push notifications not available');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body: body,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                tag: 'security-platform',
                actions: actions,
                requireInteraction: true
            });
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    }

    isOnline() {
        return navigator.onLine;
    }

    getCacheStatus() {
        return {
            static: this.cacheNames.static,
            dynamic: this.cacheNames.dynamic,
            api: this.cacheNames.api,
            backgroundSync: this.backgroundSync,
            pushNotifications: this.pushNotifications,
            offlineDataCount: this.offlineData.size
        };
    }

    async clearCache() {
        if ('caches' in window) {
            const cacheNames = Object.values(this.cacheNames);
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('🗑️ Cache cleared');
        }
    }

    dispose() {
        if (this.registration) {
            this.registration.unregister();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ServiceWorkerManager };
}