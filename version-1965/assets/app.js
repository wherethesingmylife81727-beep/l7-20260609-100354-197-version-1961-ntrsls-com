(function () {
    var heroIndex = 0;
    var hlsScriptLoading = false;
    var hlsCallbacks = [];

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-toggle-nav]');
        var nav = document.querySelector('[data-main-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }

        function show(index) {
            heroIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === heroIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === heroIndex);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(heroIndex - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(heroIndex + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(heroIndex + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupCardSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var typeFilter = '';

        if (!cards.length) {
            return;
        }

        function apply() {
            var keyword = normalize(inputs.map(function (input) {
                return input.value;
            }).find(Boolean) || '');
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var cardType = normalize(card.querySelector('.type-badge') ? card.querySelector('.type-badge').textContent : '');
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var typeMatch = !typeFilter || cardType === normalize(typeFilter);
                card.classList.toggle('is-hidden', !(keywordMatch && typeMatch));
            });
        }

        inputs.forEach(function (input) {
            if (query) {
                input.value = query;
            }
            input.addEventListener('input', apply);
        });

        document.querySelectorAll('[data-type-filter]').forEach(function (button) {
            button.addEventListener('click', function () {
                typeFilter = button.getAttribute('data-type-filter') || '';
                document.querySelectorAll('[data-type-filter]').forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });

        grids.forEach(function (grid) {
            grid.setAttribute('aria-live', 'polite');
        });
        apply();
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        hlsCallbacks.push(callback);
        if (hlsScriptLoading) {
            return;
        }
        hlsScriptLoading = true;
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.async = true;
        script.onload = function () {
            hlsCallbacks.splice(0).forEach(function (fn) {
                fn();
            });
        };
        script.onerror = function () {
            hlsCallbacks.splice(0).forEach(function (fn) {
                fn(new Error('hls load failed'));
            });
        };
        document.head.appendChild(script);
    }

    function playVideo(player) {
        var video = player.querySelector('video');
        var src = player.getAttribute('data-video-url');
        if (!video || !src) {
            return;
        }
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.play().catch(function () {});
            return;
        }

        loadHls(function (error) {
            if (!error && window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = src;
                video.play().catch(function () {});
            }
        });
    }

    function setupPlayers() {
        document.querySelectorAll('[data-play-video]').forEach(function (button) {
            button.addEventListener('click', function () {
                var player = button.closest('.movie-player');
                if (player) {
                    playVideo(player);
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupCardSearch();
        setupPlayers();
    });
})();
