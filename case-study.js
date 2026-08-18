/*
 * Turns the existing project material into a single, readable case-study
 * sequence. The source copy and media stay in each project page; this only
 * places them in the order a visitor naturally reads them.
 */
(function () {
  function addSiteNavigation() {
    var topBar = document.querySelector('.top-bar');
    if (!topBar || topBar.querySelector('.site-nav')) return;

    topBar.innerHTML = [
      '<a class="site-name" href="../index.html" aria-label="Carlos Tarrats — Work">Carlos Tarrats</a>',
      '<nav class="site-nav" aria-label="Primary navigation">',
      '<a href="../index.html">Work</a>',
      '<a href="../about.html">About</a>',
      '<a href="../contact.html">Contact</a>',
      '</nav>'
    ].join('');
  }

  function useWorkFooter() {
    var footer = document.querySelector('.detail-footer');
    if (!footer) return;
    footer.className = 'page';
    var copyright = footer.querySelector('.body');
    if (copyright) copyright.classList.add('center');
    var detailPage = footer.closest('.detail-page');
    if (detailPage && detailPage.parentNode) {
      detailPage.parentNode.insertBefore(footer, detailPage.nextSibling);
    }
  }

  function buildCaseStudy() {
    var article = document.querySelector('.content-card');
    var header = article && article.querySelector('.project-header');
    var visuals = article && article.querySelector('.project-images');
    var text = article && article.querySelector('.project-text');

    addSiteNavigation();
    useWorkFooter();

    var detailNav = document.querySelector('.detail-nav');
    var externalLink = detailNav && detailNav.querySelector('.external-link');
    var title = header && header.querySelector('.project-header__title');
    if (title && title.tagName !== 'H1') {
      var heading = document.createElement('h1');
      heading.className = title.className;
      heading.innerHTML = title.innerHTML;
      title.parentNode.replaceChild(heading, title);
      title = heading;
    }
    if (externalLink && title) {
      var externalLabel = externalLink.textContent.trim();
      var label = document.createElement('span');
      label.className = 'project-link__label';
      label.textContent = externalLabel;
      var arrow = document.createElement('span');
      arrow.className = 'project-link__arrow text-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '\u2197\uFE0E';
      externalLink.replaceChildren(label, arrow);
      var titleGroup = document.createElement('div');
      titleGroup.className = 'project-header__title-group';
      title.parentNode.insertBefore(titleGroup, title);
      titleGroup.appendChild(title);
      externalLink.classList.add('project-link');
      titleGroup.appendChild(externalLink);
    }
    if (detailNav) detailNav.remove();

    if (!article || !header || !visuals || !text || article.querySelector('.case-study')) return;

    var chapters = Array.prototype.slice.call(text.querySelectorAll('.project-text__section'));
    var visualItems = Array.prototype.slice.call(visuals.children).filter(function (item) {
      return item.nodeType === 1;
    });

    if (!chapters.length) return;

    // Flatten the original image groups so every walkthrough gets one
    // primary hero visual, followed by a consistently ordered image grid.
    visualItems = visualItems.reduce(function (items, item) {
      if (item.classList.contains('project-images__grid')) {
        return items.concat(Array.prototype.slice.call(item.children));
      }
      // Some older projects include editorial copy between image groups.
      // The walkthrough already presents its narrative in the left column,
      // so keep this legacy copy out of the image grid.
      if (item.classList.contains('project-images__section-intro')) {
        return items;
      }
      items.push(item);
      return items;
    }, []);

    // Embedded videos read best directly after the supporting copy; keep the
    // project-image grid reserved for the visual work itself.
    var embeddedMedia = visualItems.filter(function (item) {
      return item.querySelector('iframe');
    });
    visualItems = visualItems.filter(function (item) {
      return !item.querySelector('iframe');
    });

    var caseStudy = document.createElement('div');
    caseStudy.className = 'case-study';
    caseStudy.setAttribute('aria-label', 'Project case study');
    article.insertBefore(caseStudy, header);

    var intro = document.createElement('section');
    intro.className = 'case-study__intro';
    intro.appendChild(header);
    caseStudy.appendChild(intro);

    var heroMedia = visualItems.shift();
    if (heroMedia) {
      var hero = document.createElement('div');
      hero.className = 'case-study__hero-media';
      hero.appendChild(heroMedia);
      caseStudy.appendChild(hero);
    }

    var content = document.createElement('section');
    content.className = 'case-study__content';
    if (!visualItems.length && !embeddedMedia.length) {
      content.classList.add('case-study__content--copy-only');
    }

    var copy = document.createElement('div');
    copy.className = 'case-study__copy';
    chapters.forEach(function (chapter) { copy.appendChild(chapter); });
    embeddedMedia.forEach(function (item) {
      item.classList.add('case-study__inline-media');
      copy.appendChild(item);
    });
    content.appendChild(copy);

    if (visualItems.length) {
      var media = document.createElement('div');
      media.className = 'case-study__media';
      visualItems.forEach(function (item) { media.appendChild(item); });
      content.appendChild(media);
    }

    caseStudy.appendChild(content);

    visuals.hidden = true;
    text.hidden = true;
    var toggle = article.querySelector('.view-toggle');
    if (toggle) toggle.hidden = true;
    document.documentElement.classList.add('case-study-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildCaseStudy);
  } else {
    buildCaseStudy();
  }
}());
