# مشروع سياسة أمان المحتوى (CSP) - أحدث التقنيات 2025

## نظرة عامة

هذا المشروع عبارة عن دليل شامل وتطبيقي لسياسة أمان المحتوى (Content Security Policy) باستخدام أحدث التقنيات في عام 2025. يهدف المشروع إلى تعليم المطورين كيفية تطبيق أفضل الممارسات الأمنية لحماية تطبيقات الويب من التهديدات السيبرانية.

## 🚀 الميزات الرئيسية

### 📚 محتوى تعليمي شامل
- **أساسيات CSP**: شرح مبادئ سياسة أمان المحتوى
- **CSP Level 3**: أحدث إصدار من CSP مع الميزات المتقدمة
- **Trusted Types API**: حماية متقدمة من DOM XSS
- **رؤوس الأمان المتقدمة**: حماية شاملة من خلال HTTP Headers
- **أمثلة عملية قابلة للتجربة**: كود حقيقي مع تفسيرات مفصلة

### 🛠️ أدوات تفاعلية
- **CSP Builder**: منشئ تفاعلي لبناء سياسات الأمان
- **CSP Tester**: اختبار وتحليل سياسات CSP الموجودة
- **Security Scanner**: فحص شامل لأمان التطبيق
- **Code Analyzer**: تحليل كود JavaScript للثغرات الأمنية

### 🎨 تصميم عصري
- **وضع مظلم أولاً**: تصميم مناسب للمطورين
- **متجاوب بالكامل**: يعمل على جميع الأجهزة
- **دعم اللغات**: العربية والإنجليزية
- **إمكانية الوصول**: متوافق مع معايير WCAG

## 📋 متطلبات النظام

- متصفح حديث يدعم:
  - ES6+ JavaScript
  - CSS Grid و Flexbox
  - Web APIs (Clipboard, Performance Observer)
  - Trusted Types API (اختياري)

## 🏗️ بنية المشروع

```
مشروع-سياسة-أمان-المحتوى/
├── index.html                 # الصفحة الرئيسية
├── styles/
│   ├── main.css              # التصميم الأساسي
│   ├── components.css        # مكونات إضافية
│   └── responsive.css        # التصميم المتجاوب
├── js/
│   ├── main.js               # الوظائف الرئيسية
│   ├── components.js         # مكونات تفاعلية
│   └── tools.js              # الأدوات التفاعلية
├── imgs/                     # الصور التوضيحية
└── README.md                 # هذا الملف
```

## 🚀 طريقة الاستخدام

### التشغيل المحلي

1. **تحميل المشروع**
   ```bash
   # قم بتحميل جميع الملفات إلى مجلد واحد
   ```

2. **فتح المشروع**
   ```bash
   # افتح index.html في المتصفح
   # أو استخدم خادم محلي:
   python -m http.server 8000
   # ثم اذهب إلى http://localhost:8000
   ```

3. **استكشاف المحتوى**
   - ابدأ بقسم "الدليل الشامل"
   - جرب الأمثلة التفاعلية
   - استخدم الأدوات التفاعلية

### استخدام الأدوات

#### CSP Builder
```javascript
// افتح أداة بناء CSP
openCSPBuilder();

// مثال على سياسة مُولدة
const csp = `
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

#### CSP Tester
```javascript
// اختبار سياسة CSP
const testPolicy = "default-src 'self'; script-src 'self' 'unsafe-inline'";
// ستظهر النتائج والتوصيات
```

#### Security Scanner
```javascript
// فحص أمان الموقع
scanWebsite('https://example.com');
// نتائج شاملة مع التوصيات
```

## 📖 المحتوى التعليمي

### 1. أساسيات CSP
- ما هي سياسة أمان المحتوى؟
- لماذا نحتاج CSP؟
- كيفية عمل CSP
- أنواع التوجيهات

### 2. CSP Level 3
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-{random}' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  upgrade-insecure-requests;
```

### 3. Trusted Types API
```javascript
if (window.trustedTypes) {
  const policy = trustedTypes.createPolicy('myPolicy', {
    createHTML: (input) => DOMPurify.sanitize(input)
  });
  
  const safeHTML = policy.createHTML(userInput);
  element.innerHTML = safeHTML;
}
```

### 4. رؤوس الأمان المتقدمة
```http
# مجموعة شاملة من رؤوس الأمان
Content-Security-Policy: default-src 'self';
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

## 🛡️ أفضل الممارسات

### 1. سياسات آمنة
```javascript
// سياسة آمنة للإنتاج
const secureCSP = {
  'default-src': "'self'",
  'script-src': "'self' 'nonce-{random}'",
  'style-src': "'self' 'unsafe-inline'",
  'img-src': "'self' data: https:",
  'font-src': "'self' https://fonts.gstatic.com",
  'connect-src': "'self' https://api.example.com",
  'frame-ancestors': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
  'upgrade-insecure-requests': null
};
```

### 2. التحقق من الصحة
```javascript
// التحقق من صحة CSP
function validateCSP(csp) {
  const issues = [];
  
  if (csp.includes("'unsafe-inline'") && csp.includes('script-src')) {
    issues.push("تجنب 'unsafe-inline' في script-src");
  }
  
  if (csp.includes('*')) {
    issues.push("تجنب استخدام * - حدد المصادر بوضوح");
  }
  
  return issues;
}
```

### 3. المراقبة والتقارير
```javascript
// إعداد تقارير CSP
const csp = `
  default-src 'self';
  report-uri /csp-report;
`;

window.addEventListener('securitypolicyviolation', (e) => {
  console.log('CSP violation:', {
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
    originalPolicy: e.originalPolicy
  });
});
```

## 🔧 التخصيص والتطوير

### إضافة أدوات جديدة
```javascript
class NewTool extends CSPTools {
    constructor() {
        super();
        this.setupNewTool();
    }
    
    setupNewTool() {
        // إعداد الأداة الجديدة
    }
}
```

### تخصيص التصميم
```css
:root {
    /* الألوان المخصصة */
    --primary-500: #00E0D5;
    --neutral-900: #141414;
    
    /* الخطوط المخصصة */
    --font-primary: 'Your Font', sans-serif;
    
    /* المسافات المخصصة */
    --space-lg: 24px;
}
```

### إضافة محتوى جديد
```html
<section id="new-section" class="new-section">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">القسم الجديد</h2>
            <p class="section-description">وصف القسم</p>
        </div>
        <!-- محتوى القسم -->
    </div>
</section>
```

## 🧪 اختبار المشروع

### اختبار المتصفح
```bash
# اختبر على متصفحات مختلفة
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
```

### اختبار الأداء
```javascript
// مراقبة Core Web Vitals
new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
        console.log(`${entry.name}: ${entry.value}`);
    });
}).observe({entryTypes: ['largest-contentful-paint', 'first-input']});
```

## 📱 دعم الأجهزة

### أحجام الشاشة
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

### المتصفحات المدعومة
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Internet Explorer (دعم محدود)

## 🔍 استكشاف الأخطاء

### مشاكل شائعة

#### 1. عدم ظهور الأدوات التفاعلية
```javascript
// تأكد من تحميل JavaScript
console.log('CSP Project loaded:', typeof CSPProject);
```

#### 2. مشاكل في النسخ إلى الحافظة
```javascript
// تحقق من دعم Clipboard API
if (navigator.clipboard) {
    // استخدم Clipboard API
} else {
    // استخدم fallback method
}
```

#### 3. مشاكل في التصميم المتجاوب
```css
/* تأكد من viewport meta tag */
<meta name="viewport" content="width=device-width, initial-scale=1.0">

/* تحقق من CSS Grid support */
@supports (display: grid) {
    /* CSS Grid styles */
}
```

## 🤝 المساهمة

نرحب بالمساهمات! يمكنك:

1. **الإبلاغ عن الأخطاء**: استخدم GitHub Issues
2. **اقتراح ميزات جديدة**: أرسل اقتراحاتك
3. **تحسين المحتوى**: ساعد في تطوير المحتوى
4. **ترجمة**: ساعد في ترجمة المحتوى لغات أخرى

### إرشادات المساهمة
- اتبع معايير الكود الموجودة
- اختبر تغييراتك على متصفحات مختلفة
- حدث التوثيق عند الحاجة
- اكتب رسائل commit واضحة

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🙏 شكر وتقدير

- **MDN Web Docs**: للمصادر التقنية الشاملة
- **W3C**: لمواصفات CSP الرسمية  
- **OWASP**: لأفضل ممارسات الأمان
- **Community**: للمساهمات والملاحظات

## 📞 التواصل

- **البريد الإلكتروني**: contact@content-security-policy.com
- **الموقع**: [مشروع سياسة أمان المحتوى](https://example.com)
- **GitHub**: [المستودع](https://github.com/example/csp-project)

---

**تم التطوير بـ ❤️ لخدمة مجتمع المطورين العرب**

> "الأمان ليس منتجاً، بل عملية" - هذا المشروع يساعدك في بناء تطبيقات ويب آمنة من البداية.