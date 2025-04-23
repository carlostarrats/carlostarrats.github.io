document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const scrollContainer = document.querySelector('.projects-scroll');
  const prevButton = document.querySelector('.scroll-nav-button.prev');
  const nextButton = document.querySelector('.scroll-nav-button.next');
  
  // Skip if elements don't exist (like on non-homepage pages)
  if (!scrollContainer || !prevButton || !nextButton) return;
  
  let isScrolling;
  
  // Handle scroll events
  scrollContainer.addEventListener('scroll', () => {
    // Add scrolling class
    scrollContainer.classList.add('scrolling');
    
    // Clear previous timeout
    clearTimeout(isScrolling);
    
    // Set timeout to remove scrolling class
    isScrolling = setTimeout(() => {
      scrollContainer.classList.remove('scrolling');
    }, 150);
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    const hasScrolledRight = scrollLeft > 0;
    const canScrollMore = Math.ceil(scrollLeft + clientWidth) < scrollWidth;
    
    // Toggle button visibility based on scroll position
    prevButton.classList.toggle('visible', hasScrolledRight);
    nextButton.classList.toggle('visible', canScrollMore);
  });
  
  // Get the visible width of the container
  const getVisibleWidth = () => {
    return scrollContainer.clientWidth;
  };
  
  // Calculate the next scroll position based on direction
  const getNextScrollPosition = (direction) => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    const visibleWidth = getVisibleWidth();
    
    if (direction === 'next') {
      // Calculate the next scroll position
      const remainingScroll = scrollWidth - (scrollLeft + clientWidth);
      // If remaining scroll is less than visible width, scroll to end
      return remainingScroll < visibleWidth ? scrollWidth - clientWidth : scrollLeft + visibleWidth;
    } else {
      // Calculate the previous scroll position
      return Math.max(0, scrollLeft - visibleWidth);
    }
  };
  
  // Smooth scroll to target position
  const smoothScroll = (targetPosition) => {
    const start = scrollContainer.scrollLeft;
    const distance = targetPosition - start;
    const startTime = performance.now();
    const duration = 500;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easing = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const easedProgress = easing(progress);
      
      scrollContainer.scrollLeft = start + (distance * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };
  
  // Button click handlers
  prevButton.addEventListener('click', () => {
    const targetPosition = getNextScrollPosition('prev');
    smoothScroll(targetPosition);
  });
  
  nextButton.addEventListener('click', () => {
    const targetPosition = getNextScrollPosition('next');
    smoothScroll(targetPosition);
  });
  
  // Initial visibility check
  const { scrollWidth, clientWidth } = scrollContainer;
  nextButton.classList.toggle('visible', scrollWidth > clientWidth);
}); 