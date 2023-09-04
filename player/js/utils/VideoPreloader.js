// import { isSafari } from './common';
// import createNS from './helpers/svg_elements';
// import dataManager from './DataManager';
import createTag from './helpers/html_elements';

const VideoPreloader = (function () {
  var proxyVideo = (function () {
    var canvas = createTag('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 1, 1);
    return canvas;
  }());

  function videoLoaded() {
    this.loadedAssets += 1;
    if (this.loadedAssets === this.totalVideos && this.loadedFootagesCount === this.totalFootages) {
      // console.log('VideoPreloader::Videos Loaded call back now');
      this._emit('videoLoaded', {
        loaded: this.loadedAssets,
      });
      if (this.videosLoadedCb) {
        this.videosLoadedCb(null);
      }
    }
  }

  function videoLoadedMetadata(event) {
    // console.log('VideoPreloader::videoLoadedMetadata()', event.type, event.target, this);
    if (event.target) {
      event.target.pause();
    }
  }

  function videoEvent() {
    // console.log('VideoPreloader::videoEvent()', event.type, event.target, this);
  }

  function videoErrorEvent(event) {
    // console.log('VideoPreloader::videoErrorEvent()', event.type, event.target, this);
    // console.log('VideoPreloader::error proxy', proxyVideo);
    if (event.target) {
      var videoItem = this.videos.find((item) => item.video === event.target);
      // console.log('VideoPreloader::finding ob', videoItem);
      videoItem.video = proxyVideo;
      this._videoLoaded();
    }
  }

  function getAssetsPath(assetData, assetsPath, originalPath) {
    var path = '';
    if (assetData.e) {
      path = assetData.p;
    } else if (assetsPath) {
      var assetPath = assetData.p;
      if (assetPath.indexOf('images/') !== -1) {
        assetPath = assetPath.split('/')[1];
      }
      path = assetsPath + assetPath;
    } else {
      path = originalPath;
      path += assetData.u ? assetData.u : '';
      path += assetData.p;
    }
    return path;
  }

  function createVideoData(assetData) {
    var path = getAssetsPath(assetData, this.assetsPath, this.path);
    var video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.autoplay = 'autoplay';
    video.preload = 'auto';
    video.muted = this.isMuted;
    // video.addEventListener('play', this._videoEvent, false);
    // video.addEventListener('playing', this._videoEvent, false);
    // video.addEventListener('waiting', this._videoEvent, false);
    // video.addEventListener('seeked', this._videoEvent, false);
    // video.addEventListener('seeking', this._videoEvent, false);
    // video.addEventListener('progress', this._videoEvent, false);
    video.addEventListener('canplaythrough', this._videoLoaded, false);
    video.addEventListener('canplay', this._videoLoaded, false);
    video.addEventListener('load', this._videoLoaded, false);
    video.addEventListener('error', this._videoErrorEvent, false);
    video.addEventListener('loadedmetadata', this._videoLoadedMetadata, false);

    video.src = path;
    video.load();
    video.pause();

    return {
      video,
      assetData,
    };
  }

  function isValid(filename) {
    var regex = /\.(mp4|mov|ogg|mpg|webm)$/i;
    return regex.test(filename);
  }

  function loadAssets(assets, callback) {
    // console.log('VideoPreloader::loadAssets()', assets);
    this.videosLoadedCb = callback;
    var i;
    var len = assets.length;
    for (i = 0; i < len; i += 1) {
      if (!assets[i].layers) {
        if (isValid(assets[i].p)) {
          if (!assets[i].t || assets[i].t === 'seq') {
            this.videos.push(this._createVideoData(assets[i]));
          }
        }
      }
    }
    this.totalVideos = this.videos.length;
    console.log('VideoPreloader::loadAssets() videos:', this.videos);
  }

  function setPath(path) {
    this.path = path || '';
  }

  function setAssetsPath(path) {
    this.assetsPath = path || '';
  }

  function getAsset(assetData) {
    var i = 0;
    var len = this.videos.length;
    while (i < len) {
      if (this.videos[i].assetData === assetData) {
        return this.videos[i].video;
      }
      i += 1;
    }
    return null;
  }

  function destroy() {
    this.pause();
    this.videosLoadedCb = null;
    this.videos.forEach((videoItem) => {
      // videoItem
      // TODO: Remove event listeners
      // console.log('Remove video item', videoItem);
      if (videoItem.video) {
        var video = videoItem.video;
        // video.removeEventListener('play', this._videoEvent);
        // video.removeEventListener('playing', this._videoEvent);
        // video.removeEventListener('waiting', this._videoEvent);
        // video.removeEventListener('seeked', this._videoEvent);
        // video.removeEventListener('seeking', this._videoEvent);
        // video.removeEventListener('progress', this._videoEvent);
        video.removeEventListener('canplaythrough', this._videoLoaded);
        video.removeEventListener('canplay', this._videoEvent);
        video.removeEventListener('load', this._videoLoaded);
        video.removeEventListener('error', this._videoErrorEvent);
        video.removeEventListener('loadedmetadata', this._videoLoadedMetadata);
      }
    });
    this.videos.length = 0;
  }

  function loadedVideos() {
    return this.totalVideos === this.loadedAssets;
  }

  function pause() {
    this.videos.forEach((videoItem) => {
      videoItem.video.pause();
    });
  }

  function stop() {
    this.videos.forEach((videoItem) => {
      videoItem.video.currentTime = 0;
      videoItem.video.pause();
    });
  }

  function setVolume(volume) {
    this.isMuted = volume <= 0;
    this.videos.forEach((videoItem) => {
      videoItem.video.mute = this.isMuted;
    });
  }

  function setCacheType(type, elementHelper) {
    this._elementHelper = elementHelper;
    this._createVideoData = createVideoData.bind(this);
  }

  function VideoPreloaderFactory() {
    this._videoLoadedMetadata = videoLoadedMetadata.bind(this);
    this._videoLoaded = videoLoaded.bind(this);
    this._videoEvent = videoEvent.bind(this);
    this._videoErrorEvent = videoErrorEvent.bind(this);
    this._eventListeners = [];
    this.assetsPath = '';
    this.path = '';
    this.totalVideos = 0;
    this.loadedAssets = 0;
    this.videosLoadedCb = null;
    this.videos = [];
    this.isMuted = false;
    this.stop = stop.bind(this);
    this.pause = pause.bind(this);
    this.setVolume = setVolume.bind(this);
  }

  VideoPreloaderFactory.prototype = {
    loadAssets,
    setAssetsPath,
    setPath,
    loadedVideos,
    destroy,
    getAsset,
    videoLoaded,
    setCacheType,
    isValid,
  };

  VideoPreloaderFactory.prototype.addEventListener = function (event, callback) {
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push(callback);
  };

  VideoPreloaderFactory.prototype.removeEventListener = function (event, callback) {
    if (this._eventListeners[event]) {
      const index = this._eventListeners[event].indexOf(callback);
      if (index !== -1) {
        this._eventListeners[event].splice(index, 1);
      }
    }
  };

  VideoPreloaderFactory.prototype._emit = function (event, data) {
    if (this._eventListeners[event]) {
      for (var callback of this._eventListeners[event]) {
        callback(data);
      }
    }
  };

  return VideoPreloaderFactory;
}());

export default VideoPreloader;
