// ========================================
// index.html - メインページ用JavaScript
// ========================================

// Canvas波アニメーション（index.html専用）
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return; // Canvas要素が存在しない場合は終了

    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    function drawWave(amplitude, frequency, phase, color, alpha, waveModulation = 1) {
        ctx.beginPath();
        ctx.moveTo(-10, canvas.height + 10);

        for (let x = -10; x <= canvas.width + 10; x += 2) {
            // 波の高さを時間によって変動させる
            const dynamicAmplitude = amplitude * (0.8 + 0.4 * Math.sin(time * waveModulation));
            const y = canvas.height - (dynamicAmplitude * Math.sin((x * frequency) + phase) + dynamicAmplitude);
            ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width + 10, canvas.height + 10);
        ctx.closePath();

        // アンチエイリアスを無効にして境界線を除去
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.imageSmoothingEnabled = true;
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        time += 0.015;

        // 5つの波レイヤーで複雑な表現
        // 大きな基調波（遅い・ゆっくり変動）
        drawWave(40, 0.005, time * 0.3, 'rgba(255, 255, 255, 0.7)', 0.3, 0.2);

        // 中間波1（中速・右方向・中程度の変動）
        drawWave(28, 0.009, time * 1.8, 'rgba(255, 255, 255, 0.8)', 0.4, 0.8);

        // 中間波2（中速・左方向・異なる変動）
        drawWave(32, 0.007, -time * 1.2, 'rgba(255, 255, 255, 0.6)', 0.35, 0.5);

        // 小さな高速波1（速い・右方向・高速変動）
        drawWave(18, 0.015, time * 2.5, 'rgba(255, 255, 255, 0.9)', 0.5, 1.5);

        // 小さな高速波2（最も速い・左方向・最高速変動）
        drawWave(15, 0.018, -time * 3.2, 'rgba(255, 255, 255, 0.85)', 0.25, 2.0);

        animationId = requestAnimationFrame(animate);
    }

    // 初期化
    resizeCanvas();
    animate();

    // リサイズ対応
    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    // ページが非表示になったときにアニメーションを停止
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });

    // パーティクル背景アニメーション（index.html専用）
    const bubbleCanvas = document.getElementById('bubbleCanvas');
    if (!bubbleCanvas) return; // Canvas要素が存在しない場合は終了

    const bubbleCtx = bubbleCanvas.getContext('2d');

    let bubbleAnimationId;

    function resizeBubbleCanvas() {
        bubbleCanvas.width = window.innerWidth;
        bubbleCanvas.height = window.innerHeight;
    }

    // 泡のクラスを定義
    class Bubble {
        constructor() {
            this.x = Math.random() * bubbleCanvas.width;
            this.y = bubbleCanvas.height + Math.random() * 200;
            this.radius = Math.random() * 15 + 5; // 泡の半径 5-20px
            this.speed = Math.random() * 1.5 + 0.5; // 上昇速度 0.5-2px/frame
            this.opacity = Math.random() * 0.3 + 0.1; // 透明度 0.1-0.4
            this.horizontalSpeed = (Math.random() - 0.5) * 0.5; // 左右の揺れ
            this.wobble = Math.random() * Math.PI * 2; // 揺れのオフセット
            this.wobbleSpeed = Math.random() * 0.02 + 0.01; // 揺れの速度
        }

        draw() {
            bubbleCtx.save();
            bubbleCtx.globalAlpha = this.opacity;
            bubbleCtx.beginPath();
            bubbleCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

            // 海をテーマにした青系の色
            const gradient = bubbleCtx.createRadialGradient(
                this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, 'rgba(173, 216, 230, 0.8)'); // ライトブルー
            gradient.addColorStop(0.7, 'rgba(135, 206, 250, 0.6)'); // スカイブルー
            gradient.addColorStop(1, 'rgba(100, 149, 237, 0.2)'); // コーンフラワーブルー

            bubbleCtx.fillStyle = gradient;
            bubbleCtx.fill();

            // 泡の光沢効果
            bubbleCtx.beginPath();
            bubbleCtx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
            bubbleCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            bubbleCtx.fill();

            bubbleCtx.restore();
        }

        update() {
            // 上昇
            this.y -= this.speed;

            // 左右の揺れ
            this.wobble += this.wobbleSpeed;
            this.x += Math.sin(this.wobble) * 0.5;

            // 画面外に出たら下から再生成
            if (this.y < -this.radius) {
                this.y = bubbleCanvas.height + this.radius;
                this.x = Math.random() * bubbleCanvas.width;
            }

            // 左右の境界チェック
            if (this.x < -this.radius) this.x = bubbleCanvas.width + this.radius;
            if (this.x > bubbleCanvas.width + this.radius) this.x = -this.radius;

            this.draw();
        }
    }

    // 泡の配列を作成
    const bubbles = [];
    const bubbleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000); // 画面サイズに応じて調整

    for (let i = 0; i < bubbleCount; i++) {
        bubbles.push(new Bubble());
    }

    // パーティクルアニメーションループ
    function animateBubbles() {
        bubbleCtx.clearRect(0, 0, bubbleCanvas.width, bubbleCanvas.height);
        bubbles.forEach(bubble => bubble.update());
        bubbleAnimationId = requestAnimationFrame(animateBubbles);
    }

    // 初期化
    resizeBubbleCanvas();
    animateBubbles();

    // リサイズ対応
    window.addEventListener('resize', () => {
        resizeBubbleCanvas();
        // 泡の数を再調整
        const newBubbleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        if (newBubbleCount > bubbles.length) {
            for (let i = bubbles.length; i < newBubbleCount; i++) {
                bubbles.push(new Bubble());
            }
        } else if (newBubbleCount < bubbles.length) {
            bubbles.splice(newBubbleCount);
        }
    });

    // ページが非表示になったときにパーティクルアニメーションも停止
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(bubbleAnimationId);
        } else {
            animateBubbles();
        }
    });

    // 会社モーダル機能（index.html専用）
    const companyModal = document.getElementById('companyModal');
    const modalCompanyName = document.getElementById('modalCompanyName');
    const modalCompanyDescription = document.getElementById('modalCompanyDescription');
    const closeBtn = document.querySelector('.close-btn');

    // 会社データ
    const companyData = {
        '北日本造船': {
            companyInfo: 'https://kitanihonship.co.jp/',
            sns: 'https://www.instagram.com/kitanihonshipbuilding/',
            visitExperience: 'trial.html',
            description: '技術力ある商船を提供することで造船業を通じて国際社会に貢献し、その一方で地場の基幹産業として地域社会の活性化と発展に幅広く社会貢献できるよう努めています。'
        },
        'デンキョウ': {
            companyInfo: null,
            sns: null,
            visitExperience: 'trial.html',
            description: 'ケミカルタンカー等の大型船舶等の建造に携わっています。従業員は幅広い年齢層で構成されていますので、各年代の方々が働きやすい場を提供できます。'
        },
        '信和工業': {
            companyInfo: 'http://www.sinwa89.co.jp/',
            sns: null,
            visitExperience: 'trial.html',
            description: '信和工業株式会社は､北日本造船株式会社内に事務所を構え､船舶建造工程(鉄工・溶接・ステンレス加工仕上げ)を行っている会社です。'
        },
        '大島工業': {
            companyInfo: 'https://ooshima-kougyou.com/',
            sns: null,
            visitExperience: 'trial.html',
            description: '技術継承と人材育成を重視する大島工業。若手からベテランまで幅広い年齢層が活躍し、チームワークを重視した働きやすい環境を提供しています。'
        },
        '三上船舶工業': {
            companyInfo: 'https://www.mikami-marine.co.jp/',
            sns: null,
            visitExperience: 'trial.html',
            description: '船舶部品製造と修理サービスの専門企業。高品質な船舶部品の製造と、迅速で確実な修理サービスを提供しています。'
        },
        '丸博渡辺建設': {
            companyInfo: null,
            sns: null,
            visitExperience: 'trial.html',
            description: '造船所建設と土木工事の専門企業。大型プロジェクトから小規模工事まで、幅広い建設・土木工事に対応しています。'
        },
        '笹森電機': {
            companyInfo: null,
            sns: null,
            visitExperience: 'trial.html',
            description: 'あらゆる船舶の安全航行に欠かせない電気設備を、設計から施工、修理、メンテナンスまでトータルでサポートいたします。'
        },
        'JOK': {
            companyInfo: '/company/jok',
            sns: null,
            visitExperience: 'trial.html',
            description: '定期的に勉強会や研修を行い、社員全員とそして総合的に会社としての技術力向上を常とし、日々の活動として取り組んでおります。'
        },
        'ST企画': {
            companyInfo: '/company/st',
            sns: null,
            visitExperience: 'trial.html',
            description: '設計・企画開発のプロフェッショナル。船舶設計から企画開発まで、一貫したサービスを提供しています。'
        },
        '細川工業': {
            companyInfo: '/company/hosokawa',
            sns: null,
            visitExperience: 'trial.html',
            description: '精密機械・部品加工の専門企業。高精度な加工技術で、様々な産業分野に貢献しています。'
        },
        '関向工業': {
            companyInfo: '/company/sekimukai',
            sns: null,
            visitExperience: 'trial.html',
            description: '北日本造船株式会社北沼工場で、ステンレス及び軟鋼の「搬入→切断→仮組→本溶接→仕上げ→搬出」作業になります。溶接は主にティグ溶接、半自動溶接となります。'
        },
        'YTクラフト': {
            companyInfo: '/company/yt-craft',
            sns: null,
            visitExperience: 'trial.html',
            description: 'クラフト・特殊技術の専門企業。伝統技術と最新技術を融合した独自の製品を提供しています。'
        },
        '江陽産業': {
            companyInfo: '/company/koyo',
            sns: null,
            visitExperience: 'trial.html',
            description: '産業機械・システムの専門企業。システム構築から運用まで、包括的なソリューションを提供します。'
        },
        '北日本シャーリング': {
            companyInfo: '/company/kitanishi-shearing',
            sns: null,
            visitExperience: 'trial.html',
            description: '金属加工・シャーリングの専門企業。精密な金属加工技術で、高品質な製品を提供しています。'
        }
    };

    // 会社カードクリックイベント
    const companyCards = document.querySelectorAll('.company-card');
    companyCards.forEach(card => {
        card.addEventListener('click', function () {
            const companyName = this.querySelector('h3').textContent;
            const companyInfo = companyData[companyName];

            if (companyInfo) {
                modalCompanyName.textContent = companyName;
                modalCompanyDescription.textContent = companyInfo.description;

                // ボタンの状態を更新
                updateModalButtons(companyInfo);

                // モーダルを表示
                companyModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // モーダルボタンの状態更新
    function updateModalButtons(companyInfo) {
        const companyInfoBtn = document.querySelector('.company-info-btn');
        const snsBtn = document.querySelector('.sns-btn');
        const visitExperienceBtn = document.querySelector('.visit-experience-btn');

        // 会社情報ボタン
        if (companyInfo.companyInfo) {
            companyInfoBtn.style.display = 'flex';
            companyInfoBtn.onclick = () => {
                if (companyInfo.companyInfo.startsWith('http')) {
                    window.open(companyInfo.companyInfo, '_blank');
                } else {
                    window.location.href = companyInfo.companyInfo;
                }
            };
        } else {
            companyInfoBtn.style.display = 'none';
        }

        // SNSボタン
        if (companyInfo.sns) {
            snsBtn.style.display = 'flex';
            snsBtn.disabled = false;
            snsBtn.onclick = () => window.open(companyInfo.sns, '_blank');
        } else {
            snsBtn.style.display = 'none';
        }

        // 現場見学・体験ボタン
        if (companyInfo.visitExperience) {
            visitExperienceBtn.style.display = 'flex';
            visitExperienceBtn.onclick = () => {
                if (companyInfo.visitExperience.startsWith('mailto:')) {
                    window.location.href = companyInfo.visitExperience;
                } else {
                    window.location.href = companyInfo.visitExperience;
                }
            };
        } else {
            visitExperienceBtn.style.display = 'none';
        }
    }

    // モーダルを閉じる
    function closeModal() {
        companyModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // 閉じるボタンクリック
    closeBtn.addEventListener('click', closeModal);

    // モーダル背景クリックで閉じる
    companyModal.addEventListener('click', function (e) {
        if (e.target === companyModal) {
            closeModal();
        }
    });

    // ESCキーで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && companyModal.style.display === 'block') {
            closeModal();
        }
    });
});

// ========================================
// 共通機能 - スムーズスクロール
// ========================================

// 統合されたスムーズスクロール機能（全ページ共通）
document.addEventListener('DOMContentLoaded', function () {
    // ナビゲーションの高さを取得
    const nav = document.querySelector('.nav');
    const navHeight = nav ? nav.offsetHeight : 0;

    // 全てのページ内リンクにスムーズスクロールを追加
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // ナビゲーションがある場合は高さを考慮、ない場合は0
                const targetPosition = targetElement.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ========================================
// trial.html - 体験会申し込みページ用JavaScript
// ========================================

// FAQのアコーディオン機能（trial.html専用）
document.addEventListener('DOMContentLoaded', function () {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length === 0) return; // FAQ要素が存在しない場合は終了

    faqQuestions.forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const icon = button.querySelector('span:last-child');

            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                icon.classList.remove('rotate-180');
            } else {
                // 他の開いている項目を閉じる
                document.querySelectorAll('.faq-answer').forEach(el => el.style.maxHeight = null);
                document.querySelectorAll('.faq-question span:last-child').forEach(el => el.classList.remove('rotate-180'));

                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.classList.add('rotate-180');
            }
        });
    });
});
