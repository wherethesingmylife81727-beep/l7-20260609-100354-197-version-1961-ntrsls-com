(function () {
  var mobileButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    var showSlide = function (next) {
      if (!slides.length) {
        return;
      }

      active = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === active);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === active);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    setInterval(function () {
      showSlide(active + 1);
    }, 5000);
  }

  document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      var targetId = button.getAttribute('data-scroll-left') || button.getAttribute('data-scroll-right');
      var rail = document.getElementById(targetId);
      var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;

      if (rail) {
        rail.scrollBy({ left: direction * 420, behavior: 'smooth' });
      }
    });
  });

  var scope = document.querySelector('[data-filter-scope]');

  if (scope) {
    var keyword = scope.querySelector('[data-filter-keyword]');
    var region = scope.querySelector('[data-filter-region]');
    var year = scope.querySelector('[data-filter-year]');
    var sort = scope.querySelector('[data-filter-sort]');
    var grid = document.querySelector('[data-filter-grid]');
    var count = document.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid] .movie-card'));

    var applyFilter = function () {
      var query = (keyword && keyword.value ? keyword.value : '').trim().toLowerCase();
      var selectedRegion = region && region.value ? region.value : '';
      var selectedYear = year && year.value ? year.value : '';
      var visibleCards = [];

      cards.forEach(function (card) {
        var cardText = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' ').toLowerCase();
        var matchQuery = !query || cardText.indexOf(query) !== -1;
        var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var show = matchQuery && matchRegion && matchYear;

        card.hidden = !show;
        if (show) {
          visibleCards.push(card);
        }
      });

      if (sort && grid) {
        var mode = sort.value;
        var sorted = visibleCards.slice();

        if (mode === 'newest') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          });
        }

        if (mode === 'title') {
          sorted.sort(function (a, b) {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
          });
        }

        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (count) {
        count.textContent = '当前显示 ' + visibleCards.length + ' 部影视作品';
      }
    };

    [keyword, region, year, sort].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchStatus = document.querySelector('[data-search-status]');

  if (searchResults && window.hdSearchCatalog) {
    var params = new URLSearchParams(window.location.search);
    var queryText = (params.get('q') || '').trim();
    var formInput = document.querySelector('.big-search input[name="q"]');

    if (formInput) {
      formInput.value = queryText;
    }

    var renderSearchCard = function (item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
        '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="card-badge">' + escapeHtml(item.type) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <a class="movie-card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>',
        '    <p class="movie-card-desc">' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="movie-card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
        '    <div class="movie-card-tags"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    };

    var escapeHtml = function (value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    if (!queryText) {
      searchStatus.textContent = '请输入关键词开始搜索。';
      searchResults.innerHTML = '';
    } else {
      var normalized = queryText.toLowerCase();
      var matches = window.hdSearchCatalog.filter(function (item) {
        return item.searchText.indexOf(normalized) !== -1;
      }).slice(0, 96);

      searchStatus.textContent = '关键词“' + queryText + '”找到 ' + matches.length + ' 条相关内容';
      searchResults.innerHTML = matches.map(renderSearchCard).join('');
    }
  }
}());
