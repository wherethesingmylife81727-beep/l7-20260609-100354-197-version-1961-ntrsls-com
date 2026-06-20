(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function() {
      panel.classList.toggle('open');
      document.body.classList.toggle('menu-open', panel.classList.contains('open'));
    });
  }

  function initSiteSearch() {
    document.querySelectorAll('[data-site-search]').forEach(function(form) {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './search.html';
        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var next = root.querySelector('[data-hero-next]');
    var prev = root.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function(dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var input = document.querySelector('[data-filter-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function getTitle(card) {
      var title = card.querySelector('h3');
      return title ? title.textContent.trim() : '';
    }

    function applySort() {
      if (!sortSelect) {
        return;
      }
      var value = sortSelect.value;
      var sorted = cards.slice().sort(function(a, b) {
        var ay = Number(a.getAttribute('data-year')) || 0;
        var by = Number(b.getAttribute('data-year')) || 0;
        if (value === 'year-asc') {
          return ay - by;
        }
        if (value === 'title-asc') {
          return getTitle(a).localeCompare(getTitle(b), 'zh-Hans-CN');
        }
        return by - ay;
      });
      if (value === 'hot-desc') {
        sorted = cards.slice();
      }
      sorted.forEach(function(card) {
        grid.appendChild(card);
      });
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeFilter ? typeFilter.value : '';
      var visible = 0;
      cards.forEach(function(card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedType = !typeValue || cardType === typeValue;
        var shouldShow = matchedKeyword && matchedType;
        card.classList.toggle('hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', function() {
        applySort();
        applyFilter();
      });
    }
    applySort();
    applyFilter();
  }

  window.initMoviePlayer = function(source) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('[data-player-overlay]');
    if (!video || !overlay || !source) {
      return;
    }
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function() {});
      }
    }

    function start() {
      overlay.classList.add('is-hidden');
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function(event, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            video.src = source;
            playVideo();
          }
        });
        return;
      }
      video.src = source;
      playVideo();
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function() {
      if (!started) {
        start();
      }
    });
  };

  ready(function() {
    initMenu();
    initSiteSearch();
    initHero();
    initFilters();
  });
})();
