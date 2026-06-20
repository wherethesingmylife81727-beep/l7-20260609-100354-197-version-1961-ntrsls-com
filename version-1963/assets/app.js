(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function markMissingImages() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("img-missing");
      }, { once: true });
    });
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    var previous = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupSortTabs() {
    var tabs = document.querySelector("[data-sort-tabs]");
    var grid = document.querySelector("[data-sort-grid]");
    if (!tabs || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.children);
    tabs.querySelectorAll("button").forEach(function (button) {
      button.addEventListener("click", function () {
        tabs.querySelectorAll("button").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        var mode = button.getAttribute("data-sort");
        var sorted = cards.slice();
        if (mode === "latest") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          });
        } else if (mode === "popular") {
          sorted.sort(function (a, b) {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
          });
        } else {
          sorted.sort(function () {
            return Math.random() - 0.5;
          });
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      });
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var input = panel.querySelector("[data-card-search]");
      var grid = document.querySelector("[data-filter-grid]");
      var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
      var activeFilter = "全部";
      if (!grid) {
        return;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        Array.prototype.slice.call(grid.children).forEach(function (item) {
          var text = [
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-type"),
            item.getAttribute("data-year"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-tags"),
            item.textContent
          ].join(" ").toLowerCase();
          var matchesText = !keyword || text.indexOf(keyword) >= 0;
          var matchesFilter = activeFilter === "全部" || text.indexOf(activeFilter.toLowerCase()) >= 0;
          item.classList.toggle("is-hidden-card", !(matchesText && matchesFilter));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button, index) {
        if (index === 0) {
          button.classList.add("is-active");
        }
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeFilter = button.getAttribute("data-filter") || "全部";
          apply();
        });
      });
    });
  }

  function setupPlayer() {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".play-overlay");
    if (!video) {
      return;
    }
    var streamUrl = video.getAttribute("src");
    if (streamUrl && window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (streamUrl && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
  }

  function buildSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-tags=\"" + escapeHtml((movie.tags || []).join(" ")) + "\">" +
      "<a class=\"poster-link\" href=\"videos/v" + movie.id + ".html\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
      "<figure class=\"poster-shell\"><img src=\"./" + movie.thumbnail + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"play-badge\">▶</span></figure>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<a class=\"movie-title\" href=\"videos/v" + movie.id + ".html\">" + escapeHtml(movie.title) + "</a>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-meta\"><a href=\"" + movie.categoryFile + "\">" + escapeHtml(movie.categoryName) + "</a><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var form = document.querySelector("[data-search-form]");
    if (!results || !window.SiteMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (form && form.q) {
      form.q.value = query;
    }
    var movies = window.SiteMovies;
    var matched = movies;
    if (query) {
      var lower = query.toLowerCase();
      matched = movies.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase().indexOf(lower) >= 0;
      });
      if (title) {
        title.textContent = "与“" + query + "”相关的影片";
      }
    } else if (title) {
      title.textContent = "推荐影片";
    }
    results.innerHTML = matched.slice(0, 120).map(buildSearchCard).join("");
    markMissingImages();
  }

  ready(function () {
    markMissingImages();
    setupMenu();
    setupCarousel();
    setupSortTabs();
    setupFilters();
    setupPlayer();
    setupSearchPage();
  });
}());
