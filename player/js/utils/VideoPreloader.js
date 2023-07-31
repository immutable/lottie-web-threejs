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
    // console.log('VideoPreloader::videoLoaded()', event);
    this.loadedAssets += 1;
    if (this.loadedAssets === this.totalVideos && this.loadedFootagesCount === this.totalFootages) {
      if (this.videosLoadedCb) {
        this.videosLoadedCb(null);
      }
    }
  }

  function videoEvent(event) {
    console.log('VideoPreloader::videoEvent()', event.type, event);
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

  // function testImageLoaded(img) {
  //   var _count = 0;
  //   var intervalId = setInterval(function () {
  //     var box = img.getBBox();
  //     if (box.width || _count > 500) {
  //       this._imageLoaded();
  //       clearInterval(intervalId);
  //     }
  //     _count += 1;
  //   }.bind(this), 50);
  // }

  function createVideoData(assetData) {
    var path = getAssetsPath(assetData, this.assetsPath, this.path);

    // var img = createTag('img');
    var video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.autoplay = 'autoplay';
    video.preload = 'auto';
    // video.muted = 'false';
    video.addEventListener('play', this._videoEvent, false);
    video.addEventListener('playing', this._videoEvent, false);
    video.addEventListener('waiting', this._videoEvent, false);
    video.addEventListener('seeked', this._videoEvent, false);
    video.addEventListener('seeking', this._videoEvent, false);
    video.addEventListener('progress', this._videoEvent, false);
    video.addEventListener('canplaythrough', this._videoLoaded, false);
    video.addEventListener('canplay', this._videoEvent, false);
    video.addEventListener('load', this._videoLoaded, false);
    video.addEventListener('error', function () {
      ob.video = proxyVideo;
      this._videoLoaded();
    }.bind(this), false);

    video.src = path;
    video.load();
    video.pause();

    // if (this._elementHelper.append) {
    //   this._elementHelper.append(img);
    // } else {
    //   this._elementHelper.appendChild(img);
    // }
    var ob = {
      video,
      assetData,
    };
    return ob;
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
    // console.log('VideoPreloader::loadAssets() found:', this.videos);
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
    this.videosLoadedCb = null;
    this.videos.length = 0;
  }

  function loadedVideos() {
    return this.totalVideos === this.loadedAssets;
  }

  function setCacheType(type, elementHelper) {
    this._elementHelper = elementHelper;
    this._createVideoData = createVideoData.bind(this);
  }

  function VideoPreloaderFactory() {
    this._videoLoaded = videoLoaded.bind(this);
    this._videoEvent = videoEvent.bind(this);
    this.assetsPath = '';
    this.path = '';
    this.totalVideos = 0;
    this.loadedAssets = 0;
    this.videosLoadedCb = null;
    this.videos = [];
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
  };

  return VideoPreloaderFactory;
}());

export default VideoPreloader;
