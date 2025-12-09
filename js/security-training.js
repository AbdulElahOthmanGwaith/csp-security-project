/**
 * أدوات التوعية التفاعلية
 * Interactive Security Training Tools
 * Comprehensive security education and training platform
 */

class SecurityTraining {
    constructor() {
        this.modules = this.initializeTrainingModules();
        this.currentModule = null;
        this.currentLesson = 0;
        this.progress = this.loadProgress();
        this.achievements = this.loadAchievements();
        this.quizResults = this.loadQuizResults();
        this.scenarios = this.initializeScenarios();
        this.isInitialized = false;
    }

    /**
     * تهيئة وحدات التدريب
     * Initialize training modules
     */
    initializeTrainingModules() {
        return {
            fundamentals: {
                id: 'fundamentals',
                title: 'أساسيات أمان الويب',
                description: 'تعلم المفاهيم الأساسية لأمان الويب',
                difficulty: 'مبتدئ',
                estimatedTime: '30 دقيقة',
                lessons: [
                    {
                        id: 'intro',
                        title: 'مقدمة في أمان الويب',
                        content: `
                            <h2>مرحباً بك في دورة أساسيات أمان الويب</h2>
                            <p>أمان الويب هو مجموعة من التقنيات والممارسات التي تهدف إلى حماية المواقع والتطبيقات من التهديدات المختلفة.</p>
                            
                            <h3>لماذا أمان الويب مهم؟</h3>
                            <ul>
                                <li><strong>حماية البيانات:</strong> حماية معلومات المستخدمين الحساسة</li>
                                <li><strong>منع الهجمات:</strong> تجنب الهجمات مثل XSS و SQL Injection</li>
                                <li><strong>الثقة:</strong> بناء ثقة المستخدمين في تطبيقك</li>
                                <li><strong>الامتثال:</strong> الالتزام بالقوانين واللوائح</li>
                            </ul>

                            <div class="info-box">
                                <h4>إحصائية مهمة</h4>
                                <p>وفقاً للإحصائيات، <strong>43%</strong> من الشركات الصغيرة والمتوسطة تعرضت لهجمات سيبرانية في العام الماضي.</p>
                            </div>

                            <h3>أهم التهديدات الأمنية</h3>
                            <div class="threat-grid">
                                <div class="threat-card">
                                    <h4>Cross-Site Scripting (XSS)</h4>
                                    <p>حقن أكواد ضارة في صفحات الويب</p>
                                </div>
                                <div class="threat-card">
                                    <h4>SQL Injection</h4>
                                    <p>حقن استعلامات ضارة في قاعدة البيانات</p>
                                </div>
                                <div class="threat-card">
                                    <h4>Cross-Site Request Forgery (CSRF)</h4>
                                    <p>توليد طلبات غير مرغوب فيها من المستخدمين</p>
                                </div>
                                <div class="threat-card">
                                    <h4>Clickjacking</h4>
                                    <p>خداع المستخدمين للنقر على عناصر مخفية</p>
                                </div>
                            </div>
                        `,
                        quiz: {
                            question: 'ما هو الهدف الرئيسي لأمان الويب؟',
                            options: [
                                'تسريع الموقع',
                                'حماية البيانات والمستخدمين',
                                'تحسين SEO',
                                'تقليل حجم الملفات'
                            ],
                            correct: 1,
                            explanation: 'الهدف الرئيسي لأمان الويب هو حماية البيانات والمستخدمين من التهديدات والهجمات المختلفة.'
                        }
                    },
                    {
                        id: 'http-basics',
                        title: 'أساسيات HTTP وأمانه',
                        content: `
                            <h2>أساسيات HTTP وأمانه</h2>
                            <p>HTTP هو البروتوكول الأساسي لنقل البيانات في الويب، وفهمه ضروري لفهم أمان الويب.</p>

                            <h3>مكونات الطلب (Request)</h3>
                            <div class="code-example">
                                <div class="code-header">
                                    <span>HTTP Request</span>
                                    <button class="copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">نسخ</button>
                                </div>
                                <pre><code>GET /api/users HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
Accept: application/json
Authorization: Bearer abc123...</code></pre>
                            </div>

                            <h3>مكونات الاستجابة (Response)</h3>
                            <div class="code-example">
                                <div class="code-header">
                                    <span>HTTP Response</span>
                                    <button class="copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">نسخ</button>
                                </div>
                                <pre><code>HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 123
Cache-Control: no-cache

{"users": [...], "status": "success"}</code></pre>
                            </div>

                            <h3>رؤوس الأمان المهمة</h3>
="security-                            <div classheaders">
                                <div class="header-item">
                                    <strong>Content-Security-Policy</strong>
                                    <p>يحدد مصادر المحتوى المسموحة</p>
                                </div>
                                <div class="header-item">
                                    <strong>X-Frame-Options</strong>
                                    <p>منع تضمين الموقع في إطارات</p>
                                </div>
                                <div class="header-item">
                                    <strong>X-XSS-Protection</strong>
                                    <p>تفعيل حماية XSS في المتصفح</p>
                                </div>
                                <div class="header-item">
                                    <strong>Strict-Transport-Security</strong>
                                    <p>فرض استخدام HTTPS</p>
                                </div>
                            </div>

                            <div class="interactive-demo">
                                <h4>تجربة تفاعلية: رؤوس HTTP</h4>
                                <p>انقر على الرؤوس لفهم تأثيرها:</p>
                                <div class="headers-demo">
                                    <button class="header-btn" onclick="showHeaderInfo('CSP')">Content-Security-Policy</button>
                                    <button class="header-btn" onclick="showHeaderInfo('XFO')">X-Frame-Options</button>
                                    <button class="header-btn" onclick="showHeaderInfo('XSS')">X-XSS-Protection</button>
                                    <button class="header-btn" onclick="showHeaderInfo('HSTS')">Strict-Transport-Security</button>
                                </div>
                                <div id="header-info" class="header-info"></div>
                            </div>
                        `,
                        quiz: {
                            question: 'ما هو الغرض من Content-Security-Policy؟',
                            options: [
                                'تسريع تحميل الصفحات',
                                'تحديد مصادر المحتوى المسموحة',
                                'ضغط البيانات',
                                'تشفير البيانات'
                            ],
                            correct: 1,
                            explanation: 'Content-Security-Policy يحدد المصادر المسموحة للمحتوى مثل السكريبت والأنماط والصور.'
                        }
                    },
                    {
                        id: 'csp-basics',
                        title: 'أساسيات سياسة أمان المحتوى',
                        content: `
                            <h2>سياسة أمان المحتوى (CSP)</h2>
                            <p>CSP هي طبقة أمان قوية تساعد في منع هجمات XSS وتوفر تحكماً دقيقاً في مصادر المحتوى.</p>

                            <h3>كيف تعمل CSP؟</h3>
                            <p>يعمل CSP كحارس أمني يفحص كل عنصر قبل تحميله في المتصفح. إذا لم يطابق السياسة، يتم منعه.</p>

                            <div class="workflow-diagram">
                                <div class="workflow-step">
="step-number">                                    <div class1</div>
                                    <div class="step-content">المتصفح يطلب مورد</div>
                                </div>
                                <div class="workflow-arrow">→</div>
                                <div class="workflow-step">
                                    <div class="step-number">2</div>
                                    <div class="step-content">فحص CSP</div>
                                </div>
                                <div class="workflow-arrow">→</div>
                                <div class="workflow-step">
                                    <div class="step-number">3</div>
                                    <div class="step-content">السماح/المنع</div>
                                </div>
                                <div class="workflow-arrow">→</div>
                                <div class="workflow-step">
                                    <div class="step-number">4</div>
                                    <div class="step-content">التحميل</div>
                                </div>
                            </div>

                            <h3>أمثلة على السياسات</h3>
                            
                            <h4>سياسة صارمة</h4>
                            <div class="code-example">
                                <div class="code-header">
                                    <span>Strict CSP</span>
                                    <button class="copy-btn">نسخ</button>
                                </div>
                                <pre><code>default-src 'none';
script-src 'self';
style-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';</code></pre>
                            </div>

                            <h4>سياسة متوسطة</h4>
                            <div class="code-example">
                                <div class="code-header">
                                    <span>Moderate CSP</span>
                                    <button class="copy-btn">نسخ</button>
                                </div>
                                <pre><code>default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' https://fonts.googleapis.com;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';</code></pre>
                            </div>

                            <h3>الأوامر الأساسية</h3>
                            <div class="directives-table">
                                <div class="directive-row header">
                                    <div>الأمر</div>
                                    <div>الغرض</div>
                                    <div>مثال</div>
                                </div>
                                <div class="directive-row">
                                    <div><code>default-src</code></div>
                                    <div>مصادر افتراضية</div>
                                    <div><code>'self' https:</code></div>
                                </div>
                                <div class="directive-row">
                                    <div><code>script-src</code></div>
                                    <div>مصادر السكريبت</div>
                                    <div><code>'self' 'unsafe-inline'</code></div>
                                </div>
                                <div class="directive-row">
                                    <div><code>style-src</code></div>
                                    <div>مصادر الأنماط</div>
                                    <div><code>'self' 'unsafe-inline'</code></div>
                                </div>
                                <div class="directive-row">
                                    <div><code>img-src</code></div>
                                    <div>مصادر الصور</div>
                                    <div><code>'self' data: https:</code></div>
                                </div>
                                <div class="directive-row">
                                    <div><code>frame-ancestors</code></div>
                                    <div>المواقع التي يمكن تضمينها فيها</div>
                                    <div><code>'none'</code></div>
                                </div>
                            </div>

                            <div class="csp-builder-demo">
                                <h4>مولد CSP تفاعلي</h4>
                                <p>اختر الإعدادات لبناء سياسة CSP مخصصة:</p>
                                <div class="builder-controls">
                                    <div class="control-group">
                                        <label>السكريبت:</label>
                                        <select id="script-src">
                                            <option value="'self'">النفس فقط</option>
                                            <option value="'self' 'unsafe-inline'">النفس + المضمنة</option>
                                            <option value="'self' 'unsafe-eval'">النفس + eval()</option>
                                            <option value="'self' https://cdn.jsdelivr.net">النفس + CDN</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label>الأنماط:</label>
                                        <select id="style-src">
                                            <option value="'self'">النفس فقط</option>
                                            <option value="'self' 'unsafe-inline'">النفس + المضمنة</option>
                                            <option value="'self' https://fonts.googleapis.com">النفس + Google Fonts</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label>الصور:</label>
                                        <select id="img-src">
                                            <option value="'self'">النفس فقط</option>
                                            <option value="'self' data:">النفس + data URLs</option>
                                            <option value="'self' data: https:">النفس + جميع البروتوكولات</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label>الإطارات:</label>
                                        <select id="frame-ancestors">
                                            <option value="'none'">منع الكل</option>
                                            <option value="'self'">النفس فقط</option>
                                            <option value="'self' https://partner.com">النفس + شريك</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="csp-output">
                                    <h5>سياسة CSP المولدة:</h5>
                                    <div class="code-output">
                                        <code id="generated-csp">default-src 'self';</code>
                                    </div>
                                </div>
                            </div>
                        `,
                        quiz: {
                            question: 'أي من الأوامر التالية يمنع تضمين الموقع في إطارات خارجية؟',
                            options: [
                                'script-src',
                                'frame-ancestors',
                                'default-src',
                                'style-src'
                            ],
                            correct: 1,
                            explanation: 'frame-ancestors يحدد المواقع التي يُسمح لها بتضمين موقعك في iframe.'
                        }
                    }
                ],
                quiz: {
                    passingScore: 70,
                    questions: [
                        {
                            question: 'ما هي أخطر أنواع هجمات أمان الويب؟',
                            options: ['XSS', 'SQL Injection', 'CSRF', 'جميع ما سبق'],
                            correct: 3
                        },
                        {
                            question: 'أي رأس HTTP يمنع clickjacking؟',
                            options: ['X-XSS-Protection', 'X-Frame-Options', 'Content-Security-Policy', 'X-Content-Type-Options'],
                            correct: 1
                        }
                    ]
                }
            },
            
            xss: {
                id: 'xss',
                title: 'منع هجمات XSS',
                description: 'تعلم كيفية منع وحماية التطبيقات من هجمات Cross-Site Scripting',
                difficulty: 'متوسط',
                estimatedTime: '45 دقيقة',
                lessons: [
                    {
                        id: 'xss-intro',
                        title: 'فهم هجمات XSS',
                        content: `
                            <h2>هجمات Cross-Site Scripting (XSS)</h2>
                            <p>XSS هي واحدة من أخطر التهديدات في أمان الويب، حيث تسمح للمهاجمين بحقن أكواد ضارة في صفحات الويب.</p>

                            <h3>أنواع XSS</h3>
                            
                            <div class="xss-types">
                                <div class="xss-type">
                                    <h4>Reflected XSS</h4>
                                    <p>السكريبت ينعكس فوراً في الاستجابة</p>
                                    <div class="code-example">
                                        <pre><code>http://example.com/search?q=<script>alert('XSS')</script></code></pre>
                                    </div>
                                </div>
                                
                                <div class="xss-type">
                                    <h4>Stored XSS</h4>
                                    <p>السكريبت يُخزن في قاعدة البيانات</p>
                                    <div class="example-scenario">
                                        <p><strong>المثال:</strong> تعليق يحتوي على <code><script>...</script></code></p>
                                        <p><strong>النتيجة:</strong> السكريبت ينفذ عند كل زائر</p>
                                    </div>
                                </div>
                                
                                <div class="xss-type">
                                    <h4>DOM-based XSS</h4>
                                    <p>السكريبت ينفذ عبر JavaScript</p>
                                    <div class="code-example">
                                        <pre><code>document.getElementById("output").innerHTML = 
    "Welcome " + userInput;</code></pre>
                                    </div>
                                </div>
                            </div>

                            <div class="attack-demo">
                                <h4>تجربة تفاعلية: XSS Attack</h4>
                                <p>هذه محاكاة آمنة لهجوم XSS:</p>
                                
                                <div class="demo-input">
                                    <label>أدخل تعليقك:</label>
                                    <textarea id="xss-input" placeholder="مثال: أحب هذا الموقع!"></textarea>
                                </div>
                                
                                <div class="demo-output">
                                    <h5>كيف سيظهر تعليقك:</h5>
                                    <div id="xss-output" class="comment-display"></div>
                                </div>
                                
                                <div class="demo-actions">
                                    <button onclick="simulateXSS()">تجربة XSS</button>
                                    <button onclick="resetDemo()">إعادة تعيين</button>
                                </div>
                                
                                <div id="xss-warning" class="warning-box" style="display: none;">
                                    <strong>تحذير!</strong> تم اكتشاف محاولة XSS. هذا مثال على خطر XSS.
                                </div>
                            </div>

                            <h3>تقنيات الحماية</h3>
                            <div class="protection-methods">
                                <div class="method">
                                    <h4>1. ترميز المدخلات</h4>
                                    <p>تحويل الأحرف الخاصة إلى HTML entities</p>
                                    <div class="code-example">
                                        <pre><code>function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}</code></pre>
                                    </div>
                                </div>
                                
                                <div class="method">
                                    <h4>2. استخدام Content Security Policy</h4>
                                    <p>منع تحميل السكريبتات من مصادر غير موثوقة</p>
                                    <div class="code-example">
                                        <pre><code>Content-Security-Policy: script-src 'self'</code></pre>
                                    </div>
                                </div>
                                
                                <div class="method">
                                    <h4>3. استخدام Trusted Types</h4>
                                    <p>منع استخدام innerHTML بشكل مباشر</p>
                                    <div class="code-example">
                                        <pre><code>if (window.trustedTypes) {
    const policy = trustedTypes.createPolicy('default', {
        createHTML: (input) => input
    });
}</code></pre>
                                    </div>
                                </div>
                            </div>
                        `,
                        quiz: {
                            question: 'أي نوع من XSS يُخزن في قاعدة البيانات؟',
                            options: ['Reflected XSS', 'Stored XSS', 'DOM-based XSS', 'Blind XSS'],
                            correct: 1,
                            explanation: 'Stored XSS يتم حفظه في قاعدة البيانات ويُنفذ عند كل زائر للصفحة.'
                        }
                    },
                    {
                        id: 'xss-prevention',
                        title: 'استراتيجيات منع XSS',
                        content: `
                            <h2>استراتيجيات منع XSS</h2>
                            <p>تطبيق استراتيجيات متعددة الطبقات للحماية من هجمات XSS.</p>

                            <h3>1. ترميز البيانات</h3>
                            <div class="encoding-demo">
                                <p>جرب ترميز المدخلات المختلفة:</p>
                                <input type="text" id="encoding-input" placeholder="أدخل نص للترميز">
                                <button onclick="encodeInput()">ترميز</button>
                                <div id="encoding-output" class="output-box"></div>
                            </div>

                            <h3>2. التحقق من المدخلات</h3>
                            <div class="validation-demo">
                                <p>التحقق من صحة المدخلات:</p>
                                <input type="text" id="validation-input" placeholder="أدخل بريد إلكتروني">
                                <button onclick="validateInput()">التحقق</button>
                                <div id="validation-result" class="validation-result"></div>
                            </div>

                            <h3>3. استخدام libraries آمنة</h3>
                            <div class="library-comparison">
                                <div class="library-bad">
                                    <h4>❌ غير آمن</h4>
                                    <pre><code>element.innerHTML = userInput;</code></pre>
                                </div>
                                <div class="library-good">
                                    <h4>✅ آمن</h4>
                                    <pre><code>element.textContent = userInput;</code></pre>
                                </div>
                            </div>

                            <h3>4. تطبيق CSP مع strict-dynamic</h3>
                            <div class="csp-strict-demo">
                                <p>مثال على CSP صارمة:</p>
                                <div class="code-example">
                                    <pre><code>Content-Security-Policy: 
    default-src 'none';
    script-src 'self' 'strict-dynamic' 'nonce-abc123';
    style-src 'self';
    img-src 'self' data:;
    connect-src 'self';
    frame-ancestors 'none';</code></pre>
                                </div>
                            </div>
                        `,
                        quiz: {
                            question: 'أي من الطرق التالية هو الأكثر أماناً لعرض نص من المستخدم؟',
                            options: ['innerHTML', 'outerHTML', 'textContent', 'insertAdjacentHTML'],
                            correct: 2,
                            explanation: 'textContent يُعرض النص كنص عادي ولا ينفذ HTML أو JavaScript.'
                        }
                    }
                ]
            },
            
            csrf: {
                id: 'csrf',
                title: 'حماية من CSRF',
                description: 'تعلم كيفية حماية تطبيقك من هجمات Cross-Site Request Forgery',
                difficulty: 'متوسط',
                estimatedTime: '40 دقيقة',
                lessons: [
                    {
                        id: 'csrf-intro',
                        title: 'فهم هجمات CSRF',
                        content: `
                            <h2>Cross-Site Request Forgery (CSRF)</h2>
                            <p>CSRF يستغل ثقة الموقع في متصفح المستخدم لتنفيذ إجراءات غير مرغوب فيها.</p>

                            <h3>كيف تعمل هجمات CSRF؟</h3>
                            <div class="csrf-flow">
                                <div class="flow-step">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <strong>المستخدم يدخل موقعه البنكي</strong>
                                        <p>المستخدم مسجل دخول في موقع البنك</p>
                                    </div>
                                </div>
                                <div class="flow-arrow">↓</div>
                                <div class="flow-step">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <strong>الانتقال لموقع ضار</strong>
                                        <p>ينقر على رابط في بريد إلكتروني أو موقع</p>
                                    </div>
                                </div>
                                <div class="flow-arrow">↓</div>
                                <div class="flow-step">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <strong>توليد طلب ضار</strong>
                                        <p>الموقع الضار يرسل طلب لتحويل أموال</p>
                                    </div>
                                </div>
                                <div class="flow-arrow">↓</div>
                                <div class="flow-step">
                                    <div class="step-number">4</div>
                                    <div class="step-content">
                                        <strong>تنفيذ الإجراء</strong>
                                        <p>البنك يثق في الطلب ويُنفذه</p>
                                    </div>
                                </div>
                            </div>

                            <h3>مثال عملي</h3>
                            <div class="csrf-example">
                                <div class="malicious-site">
                                    <h4>الموقع الضار</h4>
                                    <pre><code><form action="https://bank.com/transfer" method="POST">
    <input type="hidden" name="to" value="hacker-account">
    <input type="hidden" name="amount" value="1000">
    <input type="submit" value="فوز مجاني!">
</form></code></pre>
                                </div>
                            </div>

                            <div class="csrf-demo">
                                <h4>محاكاة آمنة لهجوم CSRF</h4>
                                <p>هذه محاكاة توضح كيف يمكن استغلال الثقة:</p>
                                
                                <div class="demo-scenario">
                                    <div class="scenario-bank">
                                        <h5>موقع البنك (آمن)</h5>
                                        <p>أنت مسجل دخول في البنك</p>
                                        <p>رصيدك: $10,000</p>
                                    </div>
                                    
                                    <div class="scenario-attacker">
                                        <h5>الموقع الضار</h5>
                                        <p>محتوى: "انقر للفوز بجائزة!"</p>
                                        <form action="#" onsubmit="simulateCSRF(event)">
                                            <input type="hidden" name="transfer" value="1000">
                                            <button type="submit">احصل على جائزتك!</button>
                                        </form>
                                    </div>
                                    
                                    <div id="csrf-result" class="demo-result"></div>
                                </div>
                            </div>

                            <h3>طرق الحماية</h3>
                            <div class="protection-strategies">
                                <div class="strategy">
                                    <h4>1. CSRF Tokens</h4>
                                    <p>رموز فريدة لكل طلب</p>
                                    <div class="code-example">
                                        <pre><code><form method="POST">
    <input type="hidden" name="_token" value="{{ csrf_token() }}">
    <input type="text" name="username">
    <button type="submit">تسجيل</button>
</form></code></pre>
                                    </div>
                                </div>
                                
                                <div class="strategy">
                                    <h4>2. SameSite Cookies</h4>
                                    <p>منع إرسال الكوكيز عبر الطلبات الخارجية</p>
                                    <div class="code-example">
                                        <pre><code>Set-Cookie: sessionid=abc123; 
    SameSite=Strict; Secure; HttpOnly</code></pre>
                                    </div>
                                </div>
                                
                                <div class="strategy">
                                    <h4>3. Double Submit Cookie</h4>
                                    <p>إرسال الرمز في كل من الكوكيز والرأس</p>
                                    <div class="code-example">
                                        <pre><code>// في الكوكيز
csrf_token=xyz789

// في الرأس
X-CSRF-TOKEN: xyz789</code></pre>
                                    </div>
                                </div>
                            </div>
                        `,
                        quiz: {
                            question: 'ما هو الغرض من SameSite cookies؟',
                            options: [
                                'تسريع الموقع',
                                'منع إرسال الكوكيز عبر الطلبات الخارجية',
                                'تشفير البيانات',
                                'حفظ الجلسات'
                            ],
                            correct: 1,
                            explanation: 'SameSite cookies تمنع إرسال الكوكيز في الطلبات من مواقع خارجية، مما يمنع هجمات CSRF.'
                        }
                    }
                ]
            }
        };
    }

    /**
     * تهيئة السيناريوهات التفاعلية
     * Initialize interactive scenarios
     */
    initializeScenarios() {
        return {
            vulnerabilityScanning: {
                id: 'vuln-scan',
                title: 'مسح الثغرات الأمنية',
                description: 'تعلم كيفية مسح التطبيقات للعثور على الثغرات الأمنية',
                scenario: {
                    environment: 'تطبيق ويب تجريبي',
                    vulnerabilities: [
                        { type: 'XSS', severity: 'high', location: 'صفحة البحث', description: 'عدم ترميز المدخلات' },
                        { type: 'CSRF', severity: 'medium', location: 'نموذج تغيير كلمة المرور', description: 'عدم وجود CSRF token' },
                        { type: 'SQL Injection', severity: 'critical', location: 'صفحة تسجيل الدخول', description: 'استعلامات غير محمية' }
                    ],
                    tools: ['مولد CSP', 'محلل الثغرات', 'فاحص الأمان']
                }
            },
            
            incidentResponse: {
                id: 'incident-response',
                title: 'الاستجابة للحوادث الأمنية',
                description: 'تدرب على الاستجابة للحوادث الأمنية',
                scenario: {
                    incident: 'هجوم XSS على الموقع',
                    timeline: [
                        { time: '09:00', event: 'اكتشاف نشاط مشبوه', action: 'investigate' },
                        { time: '09:15', event: 'تأكيد الهجوم', action: 'respond' },
                        { time: '09:30', event: 'تطبيق إجراءات الطوارئ', action: 'mitigate' },
                        { time: '10:00', event: 'إصلاح الثغرة', action: 'fix' }
                    ],
                    options: [
                        { text: 'إيقاف الموقع فوراً', consequences: 'منع المزيد من الضرر ولكن يفوت الأرباح' },
                        { text: 'مراقبة الوضع أولاً', consequences: 'قد يزيد الضرر' },
                        { text: 'تطبيق تصحيح سريع', consequences: 'قد لا يكون فعالاً' }
                    ]
                }
            }
        };
    }

    /**
     * بدء وحدة التدريب
     * Start training module
     */
    startModule(moduleId) {
        const module = this.modules[moduleId];
        if (!module) {
            throw new Error(`الوحدة ${moduleId} غير موجودة`);
        }

        this.currentModule = module;
        this.currentLesson = 0;
        this.updateProgress();
        
        return this.renderCurrentLesson();
    }

    /**
     * عرض الدرس الحالي
     * Render current lesson
     */
    renderCurrentLesson() {
        if (!this.currentModule || !this.currentModule.lessons[this.currentLesson]) {
            return null;
        }

        const lesson = this.currentModule.lessons[this.currentLesson];
        return {
            module: this.currentModule,
            lesson: lesson,
            progress: {
                current: this.currentLesson + 1,
                total: this.currentModule.lessons.length,
                percentage: Math.round(((this.currentLesson + 1) / this.currentModule.lessons.length) * 100)
            }
        };
    }

    /**
     * الانتقال للدرس التالي
     * Move to next lesson
     */
    nextLesson() {
        if (!this.currentModule) return false;

        if (this.currentLesson < this.currentModule.lessons.length - 1) {
            this.currentLesson++;
            this.updateProgress();
            return true;
        }
        return false;
    }

    /**
     * الانتقال للدرس السابق
     * Move to previous lesson
     */
    previousLesson() {
        if (!this.currentModule) return false;

        if (this.currentLesson > 0) {
            this.currentLesson--;
            this.updateProgress();
            return true;
        }
        return false;
    }

    /**
     * إكمال الدرس
     * Complete lesson
     */
    completeLesson() {
        if (!this.currentModule) return;

        const lessonId = this.currentModule.lessons[this.currentLesson].id;
        if (!this.progress.completedLessons.includes(lessonId)) {
            this.progress.completedLessons.push(lessonId);
            this.updateProgress();
        }
    }

    /**
     * أداء الاختبار
     * Take quiz
     */
    takeQuiz(moduleId, answers) {
        const module = this.modules[moduleId];
        if (!module || !module.quiz) {
            throw new Error('الوحدة أو الاختبار غير موجود');
        }

        const quiz = module.quiz;
        let score = 0;

        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correct) {
                score++;
            }
        });

        const percentage = Math.round((score / quiz.questions.length) * 100);
        const passed = percentage >= quiz.passingScore;

        const result = {
            moduleId,
            score,
            total: quiz.questions.length,
            percentage,
            passed,
            timestamp: new Date().toISOString()
        };

        // حفظ النتيجة
        this.quizResults.push(result);
        this.saveQuizResults();

        // منح الإنجاز
        if (passed) {
            this.unlockAchievement(`quiz_${moduleId}`);
        }

        return result;
    }

    /**
     * تشغيل سيناريو تفاعلي
     * Run interactive scenario
     */
    runScenario(scenarioId, userChoices = []) {
        const scenario = this.scenarios[scenarioId];
        if (!scenario) {
            throw new Error(`السيناريو ${scenarioId} غير موجود`);
        }

        const scenarioResult = {
            scenarioId,
            choices: userChoices,
            score: this.calculateScenarioScore(scenario, userChoices),
            completed: true,
            timestamp: new Date().toISOString()
        };

        // حفظ النتيجة
        if (!this.progress.scenarios) {
            this.progress.scenarios = [];
        }
        this.progress.scenarios.push(scenarioResult);
        this.updateProgress();

        return scenarioResult;
    }

    /**
     * حساب نتيجة السيناريو
     * Calculate scenario score
     */
    calculateScenarioScore(scenario, choices) {
        // منطق مبسط لحساب النتيجة
        let score = 0;
        
        choices.forEach((choice, index) => {
            if (choice.correct) {
                score += 10;
            }
        });

        return Math.min(score, 100);
    }

    /**
     * فتح إنجاز
     * Unlock achievement
     */
    unlockAchievement(achievementId) {
        if (!this.achievements.find(a => a.id === achievementId)) {
            const achievement = {
                id: achievementId,
                unlockedAt: new Date().toISOString(),
                name: this.getAchievementName(achievementId),
                description: this.getAchievementDescription(achievementId)
            };

            this.achievements.push(achievement);
            this.saveAchievements();
            
            return achievement;
        }
        return null;
    }

    /**
     * الحصول على اسم الإنجاز
     * Get achievement name
     */
    getAchievementName(achievementId) {
        const names = {
            'first_lesson': 'البداية',
            'first_module': 'المتعلم النشط',
            'quiz_fundamentals': 'خبير الأساسيات',
            'quiz_xss': 'محارب XSS',
            'csrf_master': 'سيد الحماية من CSRF',
            'perfect_score': 'الكمال المطلق'
        };
        return names[achievementId] || 'إنجاز جديد';
    }

    /**
     * الحصول على وصف الإنجاز
     * Get achievement description
     */
    getAchievementDescription(achievementId) {
        const descriptions = {
            'first_lesson': 'أكملت أول درس',
            'first_module': 'أكملت أول وحدة تدريب',
            'quiz_fundamentals': 'نجحت في اختبار أساسيات أمان الويب',
            'quiz_xss': 'أتقنت منع هجمات XSS',
            'csrf_master': 'أصبحت خبير في حماية CSRF',
            'perfect_score': 'حصلت على نتيجة مثالية في اختبار'
        };
        return descriptions[achievementId] || ' إنجاز جديد';
    }

    /**
     * الحصول على التقدم
     * Get progress
     */
    getProgress() {
        const totalLessons = Object.values(this.modules)
            .reduce((total, module) => total + module.lessons.length, 0);

        const completedLessons = this.progress.completedLessons.length;
        const completedModules = Object.keys(this.modules)
            .filter(moduleId => this.isModuleCompleted(moduleId)).length;

        return {
            ...this.progress,
            totalLessons,
            completedLessons,
            completedModules,
            totalModules: Object.keys(this.modules).length,
            lessonProgress: Math.round((completedLessons / totalLessons) * 100),
            moduleProgress: Math.round((completedModules / Object.keys(this.modules).length) * 100)
        };
    }

    /**
     * فحص إكمال الوحدة
     * Check if module is completed
     */
    isModuleCompleted(moduleId) {
        const module = this.modules[moduleId];
        if (!module) return false;

        return module.lessons.every(lesson => 
            this.progress.completedLessons.includes(lesson.id)
        );
    }

    /**
     * تحديث التقدم
     * Update progress
     */
    updateProgress() {
        this.progress.lastUpdated = new Date().toISOString();
        this.saveProgress();
    }

    /**
     * حفظ التقدم
     * Save progress
     */
    saveProgress() {
        localStorage.setItem('securityTrainingProgress', JSON.stringify(this.progress));
    }

    /**
     * تحميل التقدم
     * Load progress
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('securityTrainingProgress');
            return saved ? JSON.parse(saved) : {
                completedLessons: [],
                modules: {},
                scenarios: [],
                achievements: [],
                lastUpdated: new Date().toISOString()
            };
        } catch {
            return {
                completedLessons: [],
                modules: {},
                scenarios: [],
                achievements: [],
                lastUpdated: new Date().toISOString()
            };
        }
    }

    /**
     * حفظ الإنجازات
     * Save achievements
     */
    saveAchievements() {
        localStorage.setItem('securityTrainingAchievements', JSON.stringify(this.achievements));
    }

    /**
     * تحميل الإنجازات
     * Load achievements
     */
    loadAchievements() {
        try {
            const saved = localStorage.getItem('securityTrainingAchievements');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    /**
     * حفظ نتائج الاختبارات
     * Save quiz results
     */
    saveQuizResults() {
        localStorage.setItem('securityTrainingQuizResults', JSON.stringify(this.quizResults));
    }

    /**
     * تحميل نتائج الاختبارات
     * Load quiz results
     */
    loadQuizResults() {
        try {
            const saved = localStorage.getItem('securityTrainingQuizResults');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    /**
     * الحصول على الإحصائيات
     * Get statistics
     */
    getStatistics() {
        const progress = this.getProgress();
        const avgQuizScore = this.quizResults.length > 0 
            ? Math.round(this.quizResults.reduce((sum, result) => sum + result.percentage, 0) / this.quizResults.length)
            : 0;

        return {
            totalLessons: progress.totalLessons,
            completedLessons: progress.completedLessons,
            totalModules: progress.totalModules,
            completedModules: progress.completedModules,
            totalAchievements: this.achievements.length,
            totalQuizAttempts: this.quizResults.length,
            averageQuizScore: avgQuizScore,
            lastActivity: progress.lastUpdated
        };
    }

    /**
     * تصدير التقدم
     * Export progress
     */
    exportProgress() {
        const data = {
            progress: this.progress,
            achievements: this.achievements,
            quizResults: this.quizResults,
            statistics: this.getStatistics(),
            exportDate: new Date().toISOString()
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `security-training-${timestamp}.json`;

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    /**
     * إعادة تعيين التقدم
     * Reset progress
     */
    resetProgress() {
        if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين جميع التقدم؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            this.progress = {
                completedLessons: [],
                modules: {},
                scenarios: [],
                achievements: [],
                lastUpdated: new Date().toISOString()
            };
            this.achievements = [];
            this.quizResults = [];
            
            this.saveProgress();
            this.saveAchievements();
            this.saveQuizResults();
            
            return true;
        }
        return false;
    }
}

// تصدير الكلاس للاستخدام
window.SecurityTraining = SecurityTraining;