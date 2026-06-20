(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var next = carousel.querySelector("[data-hero-next]");
      var prev = carousel.querySelector("[data-hero-prev]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      show(0);
      start();
    }

    var query = new URLSearchParams(window.location.search).get("q") || "";
    var filterInput = document.querySelector("[data-filter-input]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");

    if (filterInput && query) {
      filterInput.value = query;
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var typeValue = typeFilter ? typeFilter.value.trim() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-keywords") || "").toLowerCase();
        var type = card.getAttribute("data-type") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !typeValue || type.indexOf(typeValue) !== -1;
        var showCard = matchedKeyword && matchedType;
        card.style.display = showCard ? "" : "none";
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }
    if (typeFilter) {
      typeFilter.addEventListener("change", applyFilter);
    }
    applyFilter();
  });
})();
