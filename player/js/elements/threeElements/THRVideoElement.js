import {
  Mesh, MeshBasicMaterial,
  PlaneGeometry,
  RGBAFormat, ShaderMaterial,
  sRGBEncoding,
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
  // const pivotDebug = new AxesHelper(100);
  // this.pivotElement.add(pivotDebug);

  this.video = this.globalData.videoLoader.getAsset(this.assetData);
  if (this.video) {
    this.video.pause();
    this._canPlay = true;

    // Create a plane geometry
    var geometry = new PlaneGeometry(this.assetData.w, this.assetData.h, 3, 3);
    var texture = new VideoTexture(this.video);
    texture.encoding = sRGBEncoding;
    texture.format = RGBAFormat;

    var material;
    if (this.data.bm !== 0) {
      material = new MeshBasicMaterial({
        map: texture,
        transparent: true,
        toneMapped: false,
      });
    } else {
      // Custom Alpha hstack support
      material = new ShaderMaterial({
        transparent: true,
        uniforms: {
          u_texture: { value: texture },
        },
        vertexShader: `
                  varying vec2 vUv;
                  void main() {
                      vUv = uv;
                      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
              `,
        fragmentShader: `
                  uniform sampler2D u_texture;
                  varying vec2 vUv;
                  void main() {
                      vec4 color = texture2D(u_texture, vec2(vUv.x * 0.5, vUv.y));
                      float alpha = texture2D(u_texture, vec2(0.5 + vUv.x * 0.5, vUv.y)).r;
                      gl_FragColor = vec4(color.rgb, alpha);
                      
                      // Encodings
                      // gl_FragColor = linearToOutputTexel(gl_FragColor);
                    
                      // Get get normal blending with premultipled, use with CustomBlending, OneFactor, OneMinusSrcAlphaFactor, AddEquation.
                      // gl_FragColor.rgb *= gl_FragColor.a;
                  }
              `,
      });
    }
    this.material = material;
    var plane = new Mesh(geometry, material);
    plane.name = this.assetData.id;
    plane.x = -(this.assetData.w * 0.5);
    plane.y = -(this.assetData.h * 0.5);
    this.pivotElement.add(plane);

    // this.helper = new BoxHelper(plane, 0xff00ff);
    // this.pivotElement.add(this.helper);
  } else {
    console.warn('Video not available', this.assetData);
  }

  // var debugMaterial = new MeshBasicMaterial({
  //   side: DoubleSide,
  //   transparent: true,
  //   toneMapped: false,
  //   wireframe: false,
  //   color: new Color(0.0, 0.0, 1.0),
  // });
  // var debugGeometry = new PlaneGeometry(this.assetData.w, this.assetData.h, 3, 3);
  // var debugPlane = new Mesh(debugGeometry, debugMaterial);
  // this.baseElement.add(debugPlane);
  // this.transformedElement = plane;

  // var debugGeometry = new BoxGeometry(this.assetData.w, this.assetData.h, 10);
  // var debugMaterial = new MeshBasicMaterial({
  //   color: 0x00ff00,
  //   transparent: true,
  //   opacity: 0.5,
  // });
  // var cube = new Mesh(debugGeometry, debugMaterial);
  // this.pivotElement.add(cube);
  this.transformedElement = this.baseElement; // plane;

  if (this.data.nm) {
    this.baseElement.name = `${this.data.nm}`;
    this.pivotElement.name = `${this.data.nm}_pivot`;
  }

  if (this.data.bm !== 0) {
    this.setBlendMode();
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

  this.renderTransform();
  this.renderRenderable();
  this.renderElement();
  this.renderInnerContent();
  if (this._isFirstFrame) {
    this._isFirstFrame = false;
  }

  if (this._canPlay && this.video) {
    if (this.isInRange || !this.animationItem.isPaused) {
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
      console.log('THRVideoElement::renderFrame() playing so pause the video..', this.isInRange);
    }
  } else {
    const asset = this.globalData.videoLoader.getAsset(this.assetData);
    this.video = asset;
    this._isPlaying = false;
    this._canPlay = true;
    console.log('THRVideoElement::renderFrame() Missing WIP video', asset);
  }
};

THRVideoElement.prototype.isPlaying = function () {
  return this.video && !this.video.paused && !this.video.ended && this.video.readyState > 2;
};

THRVideoElement.prototype.show = function () {
  // this.audio.play()
  // console.log('THRVideoElement::show() ok need to play!');

  if (this.isInRange) {
    if (this.video) this.video.play();
    if (!this.data.hd) {
      var elem = this.baseElement || this.layerElement;
      elem.visible = true;
    }
    this.hidden = false;
    this._isFirstFrame = true;
  }
};

THRVideoElement.prototype.hide = function () {
  if (this.video) this.video.pause();
  this._isPlaying = false;

  // console.log('THRVideoElement::hide() ok need to hide, so we destory??');
  if (!this.hidden && !this.isInRange) {
    var elem = this.baseElement || this.layerElement;
    elem.visible = false;
    this.hidden = true;
  }
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
