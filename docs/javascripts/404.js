/**
 * @file 404.js
 * @description 404 页面交互逻辑。
 */

(function () {
  'use strict';

  function joinUrl(base, path) {
    return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
  }

  function createElement(tagName, options) {
    var element = document.createElement(tagName);
    if (!options) {
      return element;
    }

    if (options.text) {
      element.textContent = options.text;
    }
    if (options.href) {
      element.href = options.href;
    }
    if (options.id) {
      element.id = options.id;
    }
    if (options.className) {
      element.className = options.className;
    }
    if (options.target) {
      element.target = options.target;
    }
    if (options.rel) {
      element.rel = options.rel;
    }
    return element;
  }

  function appendInternalLinkMessage(container, issueUrl) {
    var heading = createElement('h3', { text: '情况分析' });
    var paragraph = createElement('p');
    paragraph.append('我们发现您可能是通过我们网站内部的一个链接到达这里的。');
    paragraph.append(document.createElement('br'));
    paragraph.append('这很可能是我们的一个疏忽，非常抱歉！');

    var helpText = createElement('p', { text: '如果您愿意花些时间帮助我们改进，我们将不胜感激：' });
    var reportLink = createElement('a', {
      href: issueUrl,
      target: '_blank',
      rel: 'noopener'
    });
    var strong = createElement('strong', { text: '点击此处提交错误报告' });
    reportLink.appendChild(strong);

    var note = createElement('p');
    var small = createElement('small', { text: '提示：点击后，请在新打开的页面中填写来源和目标链接，感谢！' });
    note.appendChild(small);

    container.replaceChildren(heading, paragraph, helpText, reportLink, note);
  }

  function appendGenericMessage(container, currentPath) {
    var heading = createElement('h3', { text: '情况分析' });
    var paragraph = createElement('p');
    paragraph.append('您尝试访问的地址 ');
    var code = createElement('code', { text: currentPath });
    paragraph.appendChild(code);
    paragraph.append(' 无法找到。');

    var intro = createElement('p', { text: '您可以：' });
    var list = createElement('ul');
    var item1 = createElement('li', { text: '检查地址栏中的拼写是否正确。' });
    var item2 = createElement('li', { text: '使用页面顶部的搜索功能查找相关内容。' });
    list.append(item1, item2);

    container.replaceChildren(heading, paragraph, intro, list);
  }

  function renderActions(container, homepageUrl, repoUrl, onRandomClick) {
    var heading = createElement('h3', { text: '接下来您想？' });
    var links = createElement('div', { id: 'action-links-container' });
    var homeLink = createElement('a', { href: homepageUrl, text: '返回首页' });
    var repoLink = createElement('a', {
      href: repoUrl,
      text: '查看项目源码',
      target: '_blank',
      rel: 'noopener'
    });
    var randomLink = createElement('a', {
      href: '#',
      text: '随便逛逛 (Feeling Lucky?)',
      id: 'random-page-link'
    });

    randomLink.addEventListener('click', onRandomClick);

    links.append(homeLink, ' | ', repoLink, ' | ', randomLink);
    container.replaceChildren(heading, links);
  }

  function init404Page() {
    var page = document.querySelector('[data-404-page]');
    if (!page) {
      return;
    }

    var reasonContainer = document.getElementById('reason-container');
    var countdownContainer = document.getElementById('countdown-container');
    var countdownTimer = document.getElementById('countdown-timer');
    var actionContainer = document.getElementById('action-container');
    var cancelLink = document.getElementById('cancel-redirect-link');

    if (!reasonContainer || !countdownContainer || !countdownTimer || !actionContainer || !cancelLink) {
      return;
    }

    var currentPath = window.location.pathname;
    var referrer = document.referrer;
    var homepageUrl = page.dataset.homeUrl;
    var repoUrl = page.dataset.repoUrl;
    var searchIndexUrl = page.dataset.searchIndexUrl;
    var issueUrl = repoUrl + '/issues/new?template=bug_report.md';

    if (referrer && referrer.startsWith(window.location.origin)) {
      appendInternalLinkMessage(reasonContainer, issueUrl);
    } else {
      appendGenericMessage(reasonContainer, currentPath);
    }

    var countdown = 10;
    var timer = setInterval(function () {
      countdown -= 1;
      countdownTimer.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(timer);
        window.location.href = homepageUrl;
      }
    }, 1000);

    cancelLink.addEventListener('click', function (event) {
      event.preventDefault();
      clearInterval(timer);

      countdownContainer.style.opacity = '0';
      setTimeout(function () {
        countdownContainer.style.display = 'none';
      }, 300);

      renderActions(actionContainer, homepageUrl, repoUrl, function (e) {
        e.preventDefault();
        var randomPageLink = e.currentTarget;
        randomPageLink.textContent = '正在寻找有趣的页面...';

        fetch(searchIndexUrl)
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            if (data.docs && data.docs.length > 0) {
              var randomIndex = Math.floor(Math.random() * data.docs.length);
              var randomPage = data.docs[randomIndex];
              window.location.href = joinUrl(homepageUrl, randomPage.location);
              return;
            }
            window.location.href = homepageUrl;
          })
          .catch(function () {
            window.location.href = homepageUrl;
          });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init404Page);
  } else {
    init404Page();
  }
})();
