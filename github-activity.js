(function () {
  'use strict';
  var grid = document.getElementById('github-activity-grid');
  var months = document.getElementById('github-activity-months');
  var summary = document.getElementById('github-activity-summary');
  var tooltip = document.getElementById('github-activity-tooltip');
  if (!grid || !months || !summary || !tooltip) return;

  var endpoint = 'https://github-contributions-api.jogruber.de/v4/carlostarrats?y=last';
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function positionTooltip(event) {
    tooltip.style.left = Math.min(event.clientX + 12, window.innerWidth - tooltip.offsetWidth - 12) + 'px';
    tooltip.style.top = Math.max(8, event.clientY - tooltip.offsetHeight - 10) + 'px';
  }

  function showTooltip(event) {
    tooltip.textContent = event.currentTarget.getAttribute('aria-label');
    tooltip.classList.add('is-visible');
    positionTooltip(event);
  }

  function hideTooltip() { tooltip.classList.remove('is-visible'); }

  function render(data) {
    var today = new Date();
    today.setHours(23, 59, 59, 999);
    var contributions = data.contributions.filter(function (day) {
      return new Date(day.date + 'T12:00:00') <= today;
    }).slice(-371);

    var firstDate = new Date(contributions[0].date + 'T12:00:00');
    var padding = firstDate.getDay();
    for (var pad = 0; pad < padding; pad += 1) {
      var empty = document.createElement('span');
      empty.className = 'github-activity__day';
      empty.setAttribute('aria-hidden', 'true');
      grid.appendChild(empty);
    }

    var seenMonths = {};
    contributions.forEach(function (day, index) {
      var date = new Date(day.date + 'T12:00:00');
      var week = Math.floor((padding + index) / 7) + 1;
      var monthKey = date.getFullYear() + '-' + date.getMonth();
      if (!seenMonths[monthKey] && date.getDate() <= 7) {
        seenMonths[monthKey] = true;
        var label = document.createElement('span');
        label.className = 'github-activity__month';
        label.style.gridColumn = week + ' / span 4';
        label.textContent = monthNames[date.getMonth()];
        months.appendChild(label);
      }

      var cell = document.createElement('button');
      var countLabel = day.count === 1 ? '1 contribution' : day.count + ' contributions';
      cell.type = 'button';
      cell.className = 'github-activity__day';
      cell.dataset.level = day.level;
      cell.setAttribute('aria-label', countLabel + ' on ' + date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }));
      cell.addEventListener('mouseenter', showTooltip);
      cell.addEventListener('mousemove', positionTooltip);
      cell.addEventListener('mouseleave', hideTooltip);
      cell.addEventListener('focus', showTooltip);
      cell.addEventListener('blur', hideTooltip);
      grid.appendChild(cell);
    });

    var total = data.total.lastYear || contributions.reduce(function (sum, day) { return sum + day.count; }, 0);
    summary.textContent = total.toLocaleString() + ' contributions in the last year';
  }

  fetch(endpoint)
    .then(function (response) {
      if (!response.ok) throw new Error('Contribution data unavailable');
      return response.json();
    })
    .then(render)
    .catch(function () {
      summary.innerHTML = 'Live contribution data is unavailable right now. <a href="https://github.com/carlostarrats" target="_blank" rel="noopener">View activity on GitHub</a>.';
    });
})();
