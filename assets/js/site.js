(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        document.addEventListener("error", function (event) {
            var target = event.target;
            if (target && target.tagName === "IMG") {
                target.classList.add("is-hidden");
            }
        }, true);

        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHero();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restartHero();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restartHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartHero();
            });
        }

        showSlide(0);
        startHero();

        var filterRoot = document.querySelector("[data-filter-root]");
        if (filterRoot) {
            var queryInput = filterRoot.querySelector("[data-filter-query]");
            var yearSelect = filterRoot.querySelector("[data-filter-year]");
            var typeSelect = filterRoot.querySelector("[data-filter-type]");
            var sortSelect = filterRoot.querySelector("[data-filter-sort]");
            var list = filterRoot.querySelector("[data-filter-list]");
            var empty = filterRoot.querySelector("[data-filter-empty]");
            var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));

            function applyFilter() {
                var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var type = typeSelect ? typeSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var terms = (card.getAttribute("data-terms") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var match = true;
                    if (query && terms.indexOf(query) === -1) {
                        match = false;
                    }
                    if (year && cardYear !== year) {
                        match = false;
                    }
                    if (type && cardType !== type) {
                        match = false;
                    }
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            function applySort() {
                if (!list || !sortSelect) {
                    return;
                }
                var value = sortSelect.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (value === "views") {
                        return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
                    }
                    if (value === "title") {
                        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                    }
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
                applyFilter();
            }

            [queryInput, yearSelect, typeSelect].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", applyFilter);
                    node.addEventListener("change", applyFilter);
                }
            });
            if (sortSelect) {
                sortSelect.addEventListener("change", applySort);
            }
            applySort();
        }
    });
})();
