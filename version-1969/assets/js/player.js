import { H as Hls } from './hls-dru42stk.js';

var videos = Array.prototype.slice.call(document.querySelectorAll('.site-video'));

videos.forEach(function (video) {
  var stream = video.getAttribute('data-stream');
  var shell = video.closest('.video-shell');
  var playButton = shell ? shell.querySelector('.center-play') : null;

  if (!stream) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = stream;
  } else if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(stream);
    hls.attachMedia(video);
  } else {
    video.src = stream;
  }

  var syncState = function () {
    if (shell) {
      shell.classList.toggle('is-playing', !video.paused && !video.ended);
    }
  };

  if (playButton) {
    playButton.addEventListener('click', function () {
      video.play();
    });
  }

  video.addEventListener('play', syncState);
  video.addEventListener('pause', syncState);
  video.addEventListener('ended', syncState);
});
