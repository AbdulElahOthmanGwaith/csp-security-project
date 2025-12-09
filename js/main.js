/* ==============================================
   الوظائف الرئيسية - مشروع سياسة أمان المحتوى
   Main JavaScript Functionality
   ============================================== */

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    initializeNavigation();
    initializeScrollEffects();
    initializeAnimations();
    initializeCodeHighlighting();
    initializeTooltips();
    initializeAccessibility();
    initializePerformanceMonitoring();
    console.log('🚀 مشروع سياسة أمان المحتوى تم تحميله بنجاح');
}

// Navigation Functions
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    // Mobile navigation toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close mobile menu when clicking on links
        const navLinkItems = document.querySelectorAll('.nav-link');
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navLinks.contains(event.target)) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Navbar scroll effect
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(20, 20, 20, 0.98)';
                navbar.style.backdropFilter = 'blur(15px)';
            } else {
                navbar.style.background = 'rgba(20, 20, 20, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            }
        });
    }
}

// Scroll to section function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const elementPosition = element.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Smooth scrolling for navigation links
function initializeScrollEffects() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });

    // Intersection Observer for active navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinkItems = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                navLinkItems.forEach(link => link.classList.remove('active'));
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-100px 0px -50% 0px'
    });

    sections.forEach(section => observer.observe(section));
}

// Initialize animations
function initializeAnimations() {
    // Fade in animation for elements
    const animatedElements = document.querySelectorAll('.guide-card, .tool-card, .tech-card');
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animationObserver.observe(element);
    });

    // Parallax effect for hero section
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            heroVisual.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        });
    }
}

// Code highlighting and copy functionality
function initializeCodeHighlighting() {
    const codeBlocks = document.querySelectorAll('.code-container');
    
    codeBlocks.forEach(block => {
        // Add line numbers
        const code = block.querySelector('code');
        if (code && !code.classList.contains('no-line-numbers')) {
            addLineNumbers(block);
        }
        
        // Add copy functionality
        addCopyButton(block);
    });
}

// Add line numbers to code blocks
function addLineNumbers(container) {
    const code = container.querySelector('code');
    if (!code) return;
    
    const lines = code.textContent.split('\n');
    const lineNumbersContainer = document.createElement('div');
    lineNumbersContainer.className = 'code-line-numbers';
    
    lines.forEach((_, index) => {
        const lineNumber = document.createElement('span');
        lineNumber.className = 'line-number';
        lineNumber.textContent = index + 1;
        lineNumbersContainer.appendChild(lineNumber);
    });
    
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    wrapper.appendChild(lineNumbersContainer);
    
    const content = document.createElement('div');
    content.className = 'code-block-content';
    content.appendChild(code);
    
    wrapper.appendChild(content);
    container.innerHTML = '';
    container.appendChild(wrapper);
}

// Add copy button to code blocks
function addCopyButton(container) {
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-btn';
    copyButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        نسخ
    `;
    
    copyButton.addEventListener('click', function() {
        const code = container.querySelector('code');
        if (code) {
            copyToClipboard(code.textContent);
            showCopyFeedback();
        }
    });
    
    const header = container.previousElementSibling;
    if (header && header.classList.contains('example-header')) {
        header.appendChild(copyButton);
    }
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('فشل في نسخ النص: ', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// Fallback copy method
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('فشل في نسخ النص: ', err);
    }
    
    document.body.removeChild(textArea);
}

// Show copy feedback
function showCopyFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.textContent = 'تم النسخ بنجاح!';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 2000);
}

// Initialize tooltips
function initializeTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
    
    elementsWithTooltips.forEach(element => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-content';
        tooltip.textContent = element.getAttribute('data-tooltip');
        
        const tooltipWrapper = document.createElement('div');
        tooltipWrapper.className = 'tooltip';
        tooltipWrapper.appendChild(tooltip);
        
        element.parentNode.insertBefore(tooltipWrapper, element);
        tooltipWrapper.appendChild(element);
    });
}

// Accessibility enhancements
function initializeAccessibility() {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'انتقل إلى المحتوى الرئيسي';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content landmark
    const heroSection = document.querySelector('#hero');
    if (heroSection) {
        heroSection.id = 'main-content';
        heroSection.setAttribute('role', 'main');
    }
    
    // Enhanced keyboard navigation
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    // Trap focus in modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal(modal.id);
            }
            
            if (e.key === 'Tab') {
                const focusable = modal.querySelectorAll(
                    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
                );
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    });
    
    // Announce dynamic content changes
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.id = 'announcer';
    document.body.appendChild(announcer);
}

// Announce message for screen readers
function announceMessage(message) {
    const announcer = document.getElementById('announcer');
    if (announcer) {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
}

// Performance monitoring
function initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('🚀 LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
        
        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                console.log('🎯 FID:', entry.processingStart - entry.startTime);
            });
        });
        fidObserver.observe({entryTypes: ['first-input']});
        
        // Cumulative Layout Shift
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                }
            });
            console.log('📊 CLS:', clsScore);
        });
        clsObserver.observe({entryTypes: ['layout-shift']});
    }
}

// Utility Functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Generate random nonce for CSP
function generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Calculate SHA-256 hash
async function calculateSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Sanitize HTML
function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Check browser support
function checkBrowserSupport() {
    const support = {
        csp: 'Content-Security-Policy' in document.head,
        trustedTypes: 'trustedTypes' in window,
        webAssembly: 'WebAssembly' in window,
        serviceWorker: 'serviceWorker' in navigator,
        intersectionObserver: 'IntersectionObserver' in window,
        performanceObserver: 'PerformanceObserver' in window,
        clipboard: 'clipboard' in navigator
    };
    
    console.log('🌐 Browser Support:', support);
    return support;
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('❌ خطأ في التطبيق:', e.error);
    // You could send error reports to analytics service here
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ خطأ غير معالج في Promise:', e.reason);
    e.preventDefault();
});

// Export functions for use in other modules
window.CSPProject = {
    scrollToSection,
    copyToClipboard,
    generateNonce,
    calculateSHA256,
    isValidUrl,
    sanitizeHTML,
    checkBrowserSupport,
    announceMessage,
    debounce,
    throttle
};