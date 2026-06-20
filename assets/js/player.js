(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    ready(function () {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var mask = player.querySelector(".player-mask");
        var button = player.querySelector(".player-play-button");
        var message = player.querySelector(".player-message");
        if (!video) {
            return;
        }

        var url = video.getAttribute("data-video-url") || "";
        var hls = null;
        var loaded = false;
        var readyToPlay = false;
        var pendingPlay = false;

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("is-visible");
        }

        function hideMask() {
            if (mask) {
                mask.classList.add("is-hidden");
            }
        }

        function playVideo() {
            hideMask();
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    showMessage("点击播放按钮开始观看");
                });
            }
        }

        function loadVideo() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (!url) {
                showMessage("视频加载失败");
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    readyToPlay = true;
                    if (pendingPlay) {
                        playVideo();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }
                    showMessage("视频加载失败");
                });
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                readyToPlay = true;
                return;
            }
            showMessage("视频加载失败");
        }

        function start() {
            pendingPlay = true;
            loadVideo();
            if (readyToPlay || video.src) {
                playVideo();
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
        }
        if (mask) {
            mask.addEventListener("click", function () {
                start();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", hideMask);
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
