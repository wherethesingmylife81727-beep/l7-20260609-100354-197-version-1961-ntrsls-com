(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function loadLocalHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (typeof import !== "function") {
      return Promise.resolve(null);
    }

    return import("./hls.js").then(function (module) {
      return module.H || module.default || null;
    }).catch(function () {
      return null;
    });
  }

  window.MoviePlayer = {
    init: function (source) {
      var video = byId("movie-player");
      var cover = byId("player-cover");
      var loaded = false;
      var hlsInstance = null;

      if (!video || !source) {
        return;
      }

      function prepare() {
        if (loaded) {
          return Promise.resolve();
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return Promise.resolve();
        }

        return loadLocalHls().then(function (HlsClass) {
          if (HlsClass && HlsClass.isSupported()) {
            hlsInstance = new HlsClass({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
          }

          video.src = source;
        });
      }

      function start() {
        prepare().then(function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }

          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        });
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!loaded) {
          start();
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
