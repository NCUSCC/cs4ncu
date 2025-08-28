/**
 * @file        readingProgress.js
 * @description 极简阅读进度功能
 * @version     1.0.0
 */

// 极简阅读进度功能
(function() {
    'use strict';

    let progressElement = null;
    let progressText = null;
    let progressCircle = null;
    let hideTimer = null;

    // 圆环周长 (根据屏幕尺寸动态调整)
    function getCircleParams() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const radius = 13; // 减小半径确保完整显示
            return {
                radius: radius,
                circumference: 2 * Math.PI * radius,
                center: 15, // 30x30 SVG的中心
                viewBox: '0 0 30 30'
            };
        } else {
            const radius = 17;
            return {
                radius: radius,
                circumference: 2 * Math.PI * radius,
                center: radius + 1, // SVG中心稍微偏移以适配容器
                viewBox: '0 0 36 36'
            };
        }
    }

    // 创建进度圆环
    function createProgressRing() {
        if (progressElement) return;

        const params = getCircleParams();

        // 创建主容器
        progressElement = document.createElement('div');
        progressElement.className = 'reading-progress';

        // 创建背景圆环
        const ring = document.createElement('div');
        ring.className = 'reading-progress-ring';

        // 创建SVG 进度环
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'reading-progress-svg');
        svg.setAttribute('viewBox', params.viewBox);

        // 创建背景圆
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('class', 'reading-progress-circle-bg');
        bgCircle.setAttribute('cx', params.center);
        bgCircle.setAttribute('cy', params.center);
        bgCircle.setAttribute('r', params.radius);

        // 创建进度圆
        progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        progressCircle.setAttribute('class', 'reading-progress-circle');
        progressCircle.setAttribute('cx', params.center);
        progressCircle.setAttribute('cy', params.center);
        progressCircle.setAttribute('r', params.radius);

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

        // 设置CSS变量（根据屏幕尺寸调整）
        updateCircleSize();
    }

    // 更新圆形尺寸
    function updateCircleSize() {
        if (!progressElement) return;
        const params = getCircleParams();
        progressElement.style.setProperty('--circle-circumference', params.circumference);
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

        const params = getCircleParams();
        const offset = params.circumference - (progress / 100) * params.circumference;
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
        const throttledResize = throttle(() => {
            updateCircleSize();
            updateProgress();
        }, 200);

        window.addEventListener('scroll', throttledUpdate, { passive: true });
        window.addEventListener('resize', throttledResize, { passive: true });
        updateProgress();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露到全局 (移除setTheme以避免与MkDocs Material主题系统冲突)
    window.ReadingProgress = {
        init: init,
        update: updateProgress
    };

})();
