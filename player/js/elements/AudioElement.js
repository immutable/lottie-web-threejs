import {
  extendPrototype,
} from '../utils/functionExtensions';
import PropertyFactory from '../utils/PropertyFactory';
import RenderableElement from './helpers/RenderableElement';
import BaseElement from './BaseElement';
import FrameElement from './helpers/FrameElement';

function AudioElement(data, globalData, comp) {
  this.initFrame();
  this.initRenderable();
  this.assetData = globalData.getAssetData(data.refId);
  this.initBaseData(data, globalData, comp);
  this._isBusy = false;
  this._isPlaying = false;
  this._canPlay = false;
  var assetPath = this.globalData.getAssetsPath(this.assetData);
  this.audio = this.globalData.audioController.createAudio(assetPath);
  this._currentTime = 0;
  this.globalData.audioController.addAudio(this);
  this._volumeMultiplier = 1;
  this._volume = 1;
  this._previousVolume = null;
  this.tm = data.tm ? PropertyFactory.getProp(this, data.tm, 0, globalData.frameRate, this) : { _placeholder: true };
  this.lv = PropertyFactory.getProp(this, data.au && data.au.lv ? data.au.lv : { k: [100] }, 1, 0.01, this);
}

AudioElement.prototype.prepareFrame = function (num) {
  this.prepareRenderableFrame(num, true);
  this.prepareProperties(num, true);
  if (!this.tm._placeholder) {
    var timeRemapped = this.tm.v;
    this._currentTime = timeRemapped;
  } else {
    this._currentTime = num / this.data.sr;
  }
  this._volume = this.lv.v[0];
  var totalVolume = this._volume * this._volumeMultiplier;
  if (this._previousVolume !== totalVolume) {
    this._previousVolume = totalVolume;
    this.audio.volume(totalVolume);
  }
};

extendPrototype([RenderableElement, BaseElement, FrameElement], AudioElement);

AudioElement.prototype.renderFrame = function () {
  // console.log('AudioElement::renderFrame range:', this.isInRange, 'can', this._canPlay, 'is', this._isPlaying, this.assetData.id);
  if (this.isInRange && this._canPlay) {
    if (!this._isPlaying) {
      if (!this._isBusy) {
        this._isBusy = true;
        console.log('AudioElement::renderFrame -> play()');
        this.audio.play().then(() => {
          this.audio.seek(this._currentTime / this.globalData.frameRate);
          this._isBusy = false;
          this._isPlaying = true;
          console.log('AudioElement::renderFrame -> play() then done');
        }).catch((error) => {
          this._isBusy = false;
          this._isPlaying = false;
          console.log('AudioElement::renderFrame -> play() catch error', error);
        });
      }
    } else if (!this.audio.playing()
      || Math.abs(this._currentTime / this.globalData.frameRate - this.audio.seek()) > 0.1
    ) {
      this.audio.seek(this._currentTime / this.globalData.frameRate);
    }
  }
};

AudioElement.prototype.show = function () {
  console.log('AudioElement::show()', this.assetData.id, 'busy', this._isBusy);
  // this.audio.play()
  this._canPlay = true;
  // console.log('AudioElement::show()', this.assetData.id);
};

AudioElement.prototype.hide = function () {
  console.log('AudioElement::hide()', this.assetData.id, 'busy', this._isBusy);
  this.audio.pause();
  this._isPlaying = false;
};

AudioElement.prototype.pause = function () {
  // console.log('AudioElement::pause()', this.assetData.id);
  console.log('AudioElement::pause()', this.assetData.id, 'busy', this._isBusy);
  this.audio.pause();
  this._isPlaying = false;
  this._canPlay = false;
};

AudioElement.prototype.resume = function () {
  // console.log('AudioElement::resume()', this.assetData.id);
  this._canPlay = true;
};

AudioElement.prototype.setRate = function (rateValue) {
  this.audio.rate(rateValue);
};

AudioElement.prototype.volume = function (volumeValue) {
  this._volumeMultiplier = volumeValue;
  this._previousVolume = volumeValue * this._volume;
  this.audio.volume(this._previousVolume);
};

AudioElement.prototype.getBaseElement = function () {
  return null;
};

AudioElement.prototype.destroy = function () {
  this.audio.pause();
};

AudioElement.prototype.sourceRectAtTime = function () {
};

AudioElement.prototype.initExpressions = function () {
};

export default AudioElement;
