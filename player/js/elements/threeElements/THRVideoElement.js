import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RGBAFormat, sRGBEncoding,
  TextureLoader,
  VideoTexture,
} from 'three';
import {
  extendPrototype,
} from '../../utils/functionExtensions';
import BaseElement from '../BaseElement';
import TransformElement from '../helpers/TransformElement';
import HierarchyElement from '../helpers/HierarchyElement';
import FrameElement from '../helpers/FrameElement';
import THRBaseElement from './THRBaseElement';
import RenderableObjectElement from '../helpers/RenderableObjectElement';
import PropertyFactory from '../../utils/PropertyFactory';

function THRVideoElement(data, globalData, comp) {
  this.assetData = globalData.getAssetData(data.refId);
  this.initElement(data, globalData, comp);
  this.video = null;
  this._isPlaying = false;
  this._canPlay = false;
  this.renderedFrame = 0;
  this.tm = data.tm ? PropertyFactory.getProp(this, data.tm, 0, globalData.frameRate, this) : { _placeholder: true };
}

extendPrototype([BaseElement, TransformElement, THRBaseElement, HierarchyElement, FrameElement, RenderableObjectElement], THRVideoElement);

THRVideoElement.prototype.createContent = function () {
  // var assetPath = `${this.globalData.renderConfig.assetsPath}${this.assetData.u}${this.assetData.p}`;

  this.video = this.globalData.videoLoader.getAsset(this.assetData);
  this.video.pause();
  this._canPlay = true;

  // Create a plane geometry
  var geometry = new PlaneGeometry(this.assetData.w, this.assetData.h);

  // Load the PNG image as a texture
  var textureLoader = new TextureLoader();

  console.log('THRVideoElement::createContent()', this.video, this.assetData, textureLoader);
  console.log('THRVideoElement::createContent()', this.globalData.renderConfig.assetsPath, 'video:', this.video);
  // var texture = textureLoader.load(assetPath);
  var texture = new VideoTexture(this.video);
  // texture.minFilter = LinearFilter;
  // texture.magFilter = LinearFilter;
  // texture.colorSpace = LinearSRGBColorSpace;
  texture.encoding = sRGBEncoding;
  texture.format = RGBAFormat;

  var material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    toneMapped: false,
  });
  this.material = material;
  var plane = new Mesh(geometry, material);
  plane.name = this.assetData.id;
  // plane.rotation.order = 'ZYX';
  // console.log('THRVideoElement::Assets loading >>>', `${assetPath}`, texture, this.layerElement, this.assetData);
  // if (this.data.hasMask) {
  //   this.imageElem = createNS('image');
  //   this.imageElem.setAttribute('width', this.assetData.w + 'px');
  //   this.imageElem.setAttribute('height', this.assetData.h + 'px');
  //   this.imageElem.setAttributeNS('http://www.w3.org/1999/xlink', 'href', assetPath);
  //   this.layerElement.appendChild(this.imageElem);
  //   this.baseElement.setAttribute('width', this.assetData.w);
  //   this.baseElement.setAttribute('height', this.assetData.h);
  // } else {
  this.baseElement.add(plane);
  this.transformedElement = plane;

  // const elem = this;
  // const data = this.data.ks;
  // this.a = PropertyFactory.getProp(elem, data.a || { k: [0, 0, 0] }, 1, 0, this);
  // this.baseElement.position.set(this.a.v[0], this.a.v[1], this.a.v[2]);
  // console.log('THRVideoElement::Anchor properties', this.data, this.data.nm, this.a.v);

  if (this.data.nm) {
    this.baseElement.name = `${this.data.nm}_pivot`;
  }
};

THRVideoElement.prototype.prepareFrame = function (num) {
  this._mdf = false;
  this.prepareRenderableFrame(num);
  this.prepareProperties(num, this.isInRange);
  this.checkTransparency();

  if (!this.tm._placeholder) {
    var timeRemapped = this.tm.v;
    if (timeRemapped === this.data.op) {
      timeRemapped = this.data.op - 1;
    }
    this.renderedFrame = timeRemapped;
  } else {
    this.renderedFrame = num / this.data.sr;
  }
};

THRVideoElement.prototype.renderFrame = function () {
  // console.log('THRVideoElement::renderFrame() isInRange', this.isInRange);
  // If it is exported as hidden (data.hd === true) no need to render
  // If it is not visible no need to render
  if (this.data.hd || this.hidden) {
    return;
  }

  // Anchor
  if (this.a) {
    this.baseElement.position.set(this.a.v[0], this.a.v[1], this.a.v[2]);
  }

  this.renderTransform();
  this.renderRenderable();
  this.renderElement();
  this.renderInnerContent();
  if (this._isFirstFrame) {
    this._isFirstFrame = false;
  }

  if (this._canPlay && this.video) {
    if (this.isInRange) {
      // console.log('THRVideoElement::renderFrame() time:', (this.renderedFrame / this.globalData.frameRate), 'vid time', this.video.currentTime, 'rate:', this.globalData.frameRate, this);
      if (!this._isPlaying) {
        this.video.play();
        this.video.currentTime = (this.renderedFrame / this.globalData.frameRate);
        this._isPlaying = true;
        console.log('THRVideoElement:renderFrame() Play', (this.renderedFrame / this.globalData.frameRate));
      } else if (!this.isPlaying()
        && Math.abs(this.renderedFrame / this.globalData.frameRate - this.video.currentTime) > 0.2
      ) {
        console.log('THRVideoElement::renderFrame() Warning frame diff:', Math.abs(this.renderedFrame / this.globalData.frameRate - this.video.currentTime));
        // console.log('Send me to new time:', (this.renderedFrame / this.globalData.frameRate));
        this.video.play();
        this.video.currentTime = (this.renderedFrame / this.globalData.frameRate) + 0.05;
        this._isPlaying = true;
      }
    } else if (this._isPlaying) {
      // Reset video
      this.video.pause();
      this.video.currentTime = 0;
      this._isPlaying = false;
    }
  } else {
    const asset = this.globalData.videoLoader.getAsset(this.assetData);
    this.video = asset;
    this._canPlay = true;
    console.log('THRVideoElement::renderFrame() Missing WIP video', asset);
  }
};

THRVideoElement.prototype.isPlaying = function () {
  return this.video && !this.video.paused && !this.video.ended && this.video.readyState > 2;
};

THRVideoElement.prototype.show = function () {
  // this.audio.play()
};

THRVideoElement.prototype.hide = function () {
  if (this.video) this.video.pause();
  this._isPlaying = false;
};

THRVideoElement.prototype.pause = function () {
  if (this.video) this.video.pause();
  this._isPlaying = false;
  // this._canPlay = false;
};

THRVideoElement.prototype.resume = function () {
  this._canPlay = true;
};

export default THRVideoElement;
