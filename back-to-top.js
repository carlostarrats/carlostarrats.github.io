(function() {
  function initBackToTop() {
    if (document.querySelector('.back-to-top')) return;

    var button = document.createElement('button');
    button.className = 'back-to-top';
    button.type = 'button';
    button.setAttribute('aria-label', 'Back to top');
    button.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
    document.body.appendChild(button);

    function updateVisibility() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop;
      var scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
      var viewportBottom = scrollTop + window.innerHeight;
      var distanceFromBottom = scrollHeight - viewportBottom;
      var nearBottom = distanceFromBottom <= Math.min(900, scrollHeight * 0.25);
      button.classList.toggle('is-visible', scrollTop > 600 && nearBottom);
    }

    button.addEventListener('click', function() {
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackToTop);
  } else {
    initBackToTop();
  }
})();
