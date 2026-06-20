(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.getElementById('mainNav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
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
                timer = null;
            }
        }

        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-bar]'));
    filterBars.forEach(function (bar) {
        var input = bar.querySelector('[data-local-search]');
        var buttons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter-type]'));
        var listing = document.querySelector('[data-listing]');
        if (!listing) {
            return;
        }
        var cards = Array.prototype.slice.call(listing.querySelectorAll('.movie-card'));
        var activeType = 'all';

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input ? input.value : '');
            cards.forEach(function (card) {
                var data = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var typeText = card.getAttribute('data-type') || '';
                var matchKeyword = !keyword || data.indexOf(keyword) !== -1;
                var matchType = activeType === 'all' || typeText.indexOf(activeType) !== -1 || data.indexOf(normalize(activeType)) !== -1;
                card.classList.toggle('is-hidden-card', !(matchKeyword && matchType));
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeType = button.getAttribute('data-filter-type') || 'all';
                buttons.forEach(function (b) {
                    b.classList.toggle('is-active', b === button);
                });
                apply();
            });
        });

        if (buttons.length) {
            buttons[0].classList.add('is-active');
        }
        apply();
    });
})();
