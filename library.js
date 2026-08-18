(function () {
  var library = document.querySelector('.library__scroll');
  var tooltip = document.getElementById('library-tooltip');
  if (!library || !tooltip) return;

  var books = Array.from(library.querySelectorAll('.library__book'));
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var activeBook = null;
  var isDragging = false;
  var lastPointerType = '';
  var suppressScrollHideUntil = 0;

  function hideTooltip() {
    activeBook = null;
    tooltip.classList.remove('is-visible');
    tooltip.textContent = '';
  }

  function positionTooltip(x, y) {
    var viewportPad = 24;
    var offsetX = 36;
    var rect = tooltip.getBoundingClientRect();
    var left = x + offsetX;
    var top = y - Math.round(rect.height * 0.62);
    if (window.innerWidth - x < x || left + rect.width > window.innerWidth - viewportPad) left = x - rect.width - offsetX;
    if (left < viewportPad) left = viewportPad;
    if (top < viewportPad) top = viewportPad;
    if (top + rect.height > window.innerHeight - viewportPad) top = window.innerHeight - rect.height - viewportPad;
    tooltip.style.left = Math.round(left) + 'px';
    tooltip.style.top = Math.round(top) + 'px';
  }

  function showTooltip(book, x, y) {
    if (isDragging || !book.dataset.summary) return;
    activeBook = book;
    tooltip.textContent = book.dataset.summary;
    tooltip.classList.add('is-visible');
    positionTooltip(x, y);
  }

  books.forEach(function (book) {
    book.addEventListener('pointerdown', function (event) {
      lastPointerType = event.pointerType || '';
    });
    book.addEventListener('mouseenter', function (event) {
      if (canHover.matches) showTooltip(book, event.clientX, event.clientY);
    });
    book.addEventListener('mousemove', function (event) {
      if (canHover.matches && activeBook === book && !isDragging) positionTooltip(event.clientX, event.clientY);
    });
    book.addEventListener('mouseleave', hideTooltip);
    book.addEventListener('focus', function () {
      var rect = book.getBoundingClientRect();
      if (canHover.matches) showTooltip(book, rect.left + rect.width / 2, rect.top + 16);
    });
    book.addEventListener('blur', hideTooltip);
    book.addEventListener('click', function (event) {
      if (canHover.matches && lastPointerType === 'mouse') return;
      event.preventDefault();
      if (activeBook === book && tooltip.classList.contains('is-visible')) return hideTooltip();
      suppressScrollHideUntil = Date.now() + 350;
      showTooltip(book, event.clientX, event.clientY);
    });
  });

  var startX;
  var startScroll;
  library.addEventListener('dragstart', function (event) { event.preventDefault(); });
  library.addEventListener('mousedown', function (event) {
    isDragging = true;
    startX = event.pageX - library.offsetLeft;
    startScroll = library.scrollLeft;
    library.classList.add('is-dragging');
    hideTooltip();
  });
  library.addEventListener('mousemove', function (event) {
    if (!isDragging) return;
    event.preventDefault();
    library.scrollLeft = startScroll - (event.pageX - library.offsetLeft - startX);
  });
  function stopDragging() {
    isDragging = false;
    library.classList.remove('is-dragging');
  }
  library.addEventListener('mouseleave', function () { stopDragging(); hideTooltip(); });
  library.addEventListener('mouseup', stopDragging);
  window.addEventListener('mouseup', stopDragging);
  library.addEventListener('scroll', function () {
    if (Date.now() >= suppressScrollHideUntil) hideTooltip();
  }, { passive: true });
  window.addEventListener('resize', hideTooltip);
}());
