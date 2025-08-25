/**
 * @file        readingProgress.js
 * @description 极简阅读进度功能
 * @version     1.0.0
 */

(function() {

    let progressElement = null;
    let progressText = null;
    let progressCircle = null;
    let hideTimer = null;

    // 圆环周长
    const CIRCLE_RADIUS = 19;
    const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

    // 创建进度圆环
    function createProgressRing() {
        if (progressElement) return;

        // 创建主容器
        progressElement = document.createElement('div');
        progressElement.className = 'reading-progress';

        // 创建背景圆环
        const ring = document.createElement('div');
        ring.className = 'reading-progress-ring';

        // 创建SVG 进度环
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'reading-progress-svg');
        svg.setAttribute('viewBox', '0 0 38 38');

        // 创建背景圆
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('class', 'reading-progress-circle-bg');
        bgCircle.setAttribute('cx', '19');
        bgCircle.setAttribute('cy', '19');
        bgCircle.setAttribute('r', CIRCLE_RADIUS);

        // 创建进度圆
        progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('class', 'reading-progress-circle');
        progressCircle.setAttribute('cx', '19');
        progressCircle.setAttribute('cy', '19');
        progressCircle.setAttribute('r', CIRCLE_RADIUS);

        svg.appendChild(bgCircle);
        svg.appendChild(progressCircle);

        // 创建中心文字
        progressText = document.createElement('div');
        progressText.className = 'reading-progress-text';
        progressText.textContent = '0%';

        // 组装元素
        progressElement.appendChild(ring);
        progressElement.appendChild(svg);
        progressElement.appendChild(progressText);
        document.body.appendChild(progressElement);
    }

    // 更新进度
    function updateProgress() {
        if (!progressElement || !progressText || !progressCircle) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const windowHeight = window.innerHeight;
        const scrollableHeight = documentHeight - windowHeight;

        let progress = 0;
        if (scrollableHeight > 0) {
            progress = Math.round((scrollTop / scrollableHeight) * 100);
            progress = Math.max(0, Math.min(100, progress));
        }

        progressText.textContent = progress + '%';

        const offset = CIRCLE_CIRCUMFERENCE - (progress / 100) * CIRCLE_CIRCUMFERENCE;
        progressCircle.style.strokeDashoffset = offset;

        progressElement.classList.add('visible');

        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if (progressElement) progressElement.classList.remove('visible');
        }, 2000);
    }

    // 节流函数
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            if (!inThrottle) {
                func.apply(this, arguments);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // 初始化
    function init() {
        createProgressRing();
        const throttledUpdate = throttle(updateProgress, 100);
        window.addEventListener('scroll', throttledUpdate, { passive: true });
        window.addEventListener('resize', throttledUpdate, { passive: true });
        updateProgress();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 设置主题 (兼容MkDocs Material主题系统)
    function setTheme(theme) {
        if (theme === 'dark' || theme === 'slate') {
            document.documentElement.setAttribute('data-md-color-scheme', 'slate');
        } else {
            document.documentElement.setAttribute('data-md-color-scheme', 'default');
        }
    }

    // 暴露到全局
    window.ReadingProgress = {
        init: init,
        update: updateProgress,
        setTheme: setTheme
    };

})();
