(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = selectAll('.hero-slide');
        if (!slides.length) {
            return;
        }
        var dots = selectAll('.hero-dot');
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle('is-active', pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle('is-active', pos === current);
            });
        }
        function next() {
            show(current + 1);
        }
        function start() {
            timer = window.setInterval(next, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        var prev = document.querySelector('.hero-prev');
        var nextButton = document.querySelector('.hero-next');
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide')) || 0);
                restart();
            });
        });
        start();
    }

    function setupSearchForms() {
        selectAll('.site-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query) {
                    event.preventDefault();
                    window.location.href = './library.html';
                }
            });
        });
    }

    function setupLocalSearch() {
        var inputs = selectAll('[data-local-search]');
        if (!inputs.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        inputs.forEach(function (input) {
            if (query && !input.value) {
                input.value = query;
            }
            var grid = document.querySelector('.filter-grid');
            var cards = selectAll('.movie-card', grid || document);
            function apply() {
                var value = normalize(input.value);
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
                });
            }
            input.addEventListener('input', apply);
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupLocalSearch();
    });
}());
