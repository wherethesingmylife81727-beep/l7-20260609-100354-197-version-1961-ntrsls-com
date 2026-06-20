(function () {
    function initPlayer(video) {
        if (!video || video.dataset.ready === '1') {
            return;
        }
        var src = video.getAttribute('data-src') || '';
        if (!src) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            video.dataset.ready = '1';
        } else {
            video.src = src;
            video.dataset.ready = '1';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var video = document.getElementById('moviePlayer');
        var button = document.querySelector('[data-play-button]');
        var box = document.querySelector('[data-player-box]');
        if (!video) {
            return;
        }
        initPlayer(video);

        function play() {
            initPlayer(video);
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (box) {
            box.addEventListener('click', function (event) {
                if (event.target === video) {
                    return;
                }
                play();
            });
        }
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
    });
})();
