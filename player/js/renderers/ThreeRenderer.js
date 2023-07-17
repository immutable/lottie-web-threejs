import {
  extendPrototype,
} from '../utils/functionExtensions';
import ThreeRendererBase from './ThreeRendererBase';
import { getExpressionsPlugin } from '../utils/common';
import AnimationItem from '../animation/AnimationItem';
import THRCompElement from '../elements/threeElements/THRCompElement';
import { VERSION } from './version';

function ThreeRenderer(animationItem, config) {
  console.log('ThreeRenderer::constructor()', VERSION, config, animationItem);
  this.animationItem = animationItem;
  this.layers = null;
  this.renderedFrame = -1;
  this.renderConfig = {
    className: (config && config.className) || '',
    imagePreserveAspectRatio: (config && config.imagePreserveAspectRatio) || 'xMidYMid slice',
    hideOnTransparent: !(config && config.hideOnTransparent === false),
    filterSize: {
      width: (config && config.filterSize && config.filterSize.width) || '400%',
      height: (config && config.filterSize && config.filterSize.height) || '400%',
      x: (config && config.filterSize && config.filterSize.x) || '-100%',
      y: (config && config.filterSize && config.filterSize.y) || '-100%',
      assetsPath: config.assetsPath,
    },
    scale: config && config.scale,
    runExpressions: !config || config.runExpressions === undefined || config.runExpressions,
    assetsPath: config && config.assetsPath,
    renderer: config && config.renderer,
  };
  this.globalData = {
    _mdf: false,
    frameNum: -1,
    renderConfig: this.renderConfig,
    isAssetsLoaded: false,
    cameraManager: this.animationItem.cameraManager,
  };
  this.pendingElements = [];
  this.elements = [];
  this.threeDElements = [];
  this.destroyed = false;
  this.camera = null;
  this.supports3d = true;
  this.rendererType = 'threejs';

  // Hook the loading process into Pixi Loader
  AnimationItem.prototype.checkLoaded = ThreeRenderer.prototype.checkLoaded;
}

extendPrototype([ThreeRendererBase], ThreeRenderer);

ThreeRenderer.prototype.createComp = function (data) {
  console.log('ThreeRenderer::createComp()', data);
  return new THRCompElement(data, this.globalData, this);
};

ThreeRenderer.prototype.checkLoaded = function () {
  console.log('AnimationItem::checkLoaded() ****', this, this.renderer);

  if (!this.isLoaded
    && this.renderer.globalData.fontManager.isLoaded
    && (this.imagePreloader.loadedImages() || this.renderer.rendererType !== 'canvas')
    && this.imagePreloader.loadedFootages()
    && this.videoPreloader.loadedVideos()
  ) {
    this.isLoaded = true;
    var expressionsPlugin = getExpressionsPlugin();
    if (expressionsPlugin) {
      expressionsPlugin.initExpressions(this);
    }
    this.renderer.initItems();
    setTimeout(function () {
      this.trigger('DOMLoaded');
    }.bind(this), 0);
    this.gotoFrame();
    if (this.autoplay) {
      this.play();
    }
  }
};

export default ThreeRenderer;
