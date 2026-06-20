(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-filter-section]'));
    sections.forEach(function (section) {
      var input = section.querySelector('[data-filter-input]');
      var selects = Array.prototype.slice.call(section.querySelectorAll('[data-filter-select]'));
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
      var empty = section.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get('q') || '';

      if (input && input.hasAttribute('data-query-input')) {
        input.value = queryValue;
      }

      function apply() {
        var query = normalize(input ? input.value : '');
        var visible = 0;
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute('data-filter-select')] = normalize(select.value);
        });
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' '));
          var ok = !query || text.indexOf(query) !== -1;
          Object.keys(filters).forEach(function (key) {
            var filterValue = filters[key];
            if (!filterValue) {
              return;
            }
            ok = ok && normalize(card.getAttribute('data-' + key)).indexOf(filterValue) !== -1;
          });
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var src = player.getAttribute('data-video-src');
      var hlsInstance = null;
      var initialized = false;

      function start() {
        if (!video || !src) {
          return;
        }
        if (!initialized) {
          initialized = true;
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', function () {
              video.play().catch(function () {});
            }, { once: true });
          } else {
            video.src = src;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
        if (button) {
          button.classList.add('hidden');
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        start();
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (hlsInstance) {
          hlsInstance.stopLoad();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
