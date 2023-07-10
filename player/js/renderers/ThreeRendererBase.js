import {
  DefaultLoadingManager,
  Group,
  Matrix4,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from 'three';
import { InteractionManager } from 'three.interactive';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  extendPrototype,
} from '../utils/functionExtensions';
import createTag from '../utils/helpers/html_elements';
import SVGRenderer from './SVGRenderer';
import BaseRenderer from './BaseRenderer';
import HTextElement from '../elements/htmlElements/HTextElement';
import SVGTextLottieElement from '../elements/svgElements/SVGTextElement';
import THRShapeElement from '../elements/threeElements/THRShapeElement';
import THRImageElement from '../elements/threeElements/THRImageElement';
import THRSolidElement from '../elements/threeElements/THRSolidElement';
import THRCameraElement from '../elements/threeElements/THRCameraElement';
import THRVideoElement from '../elements/threeElements/THRVideoElement';
import { VERSION } from './version';
import THRNullElement from '../elements/threeElements/THRNullElement';

function ThreeRendererBase(animationItem, config) {
  console.log('ThreeRendererBase::constructor()', VERSION, config, animationItem);
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
    },
    assetsPath: config && config.assetsPath,
    renderer: config && config.renderer,
  };
  this.globalData = {
    _mdf: false,
    frameNum: -1,
    renderConfig: this.renderConfig,
    isAssetsLoaded: false,
  };
  this.pendingElements = [];
  this.elements = [];
  this.threeDElements = [];
  this.destroyed = false;
  this.camera = null;
  this.supports3d = true;
  this.rendererType = 'threejs';
}

extendPrototype([BaseRenderer], ThreeRendererBase);

ThreeRendererBase.prototype.buildItem = SVGRenderer.prototype.buildItem;

ThreeRendererBase.prototype.checkPendingElements = function () {
  while (this.pendingElements.length) {
    var element = this.pendingElements.pop();
    element.checkParenting();
  }
};

ThreeRendererBase.prototype.appendElementInPos = function (element, pos) {
  var newDOMElement = element.getBaseElement();
  if (!newDOMElement) {
    return;
  }
  var layer = this.layers[pos];
  if (!layer.ddd || !this.supports3d) {
    if (this.threeDElements) {
      this.addTo3dContainer(newDOMElement, pos);
    } else {
      var i = 0;
      var nextDOMElement;
      var nextLayer;
      var tmpDOMElement;
      while (i < pos) {
        if (this.elements[i] && this.elements[i] !== true && this.elements[i].getBaseElement) {
          nextLayer = this.elements[i];
          tmpDOMElement = this.layers[i].ddd ? this.getThreeDContainerByPos(i) : nextLayer.getBaseElement();
          nextDOMElement = tmpDOMElement || nextDOMElement;
        }
        i += 1;
      }
      if (nextDOMElement) {
        if (!layer.ddd || !this.supports3d) {
          const elemIndex = this.layerElement.children.indexOf(newDOMElement);
          if (elemIndex >= 0) {
            this.layerElement.children.splice(elemIndex, 0, nextDOMElement);
          } else {
            this.layerElement.add(newDOMElement);
          }
        }
      } else if (!layer.ddd || !this.supports3d) {
        this.layerElement.add(newDOMElement);
      }
    }
  } else {
    this.addTo3dContainer(newDOMElement, pos);
  }
};

ThreeRendererBase.prototype.createNull = function (data) {
  console.log('ThreeRendererBase::createNull()', data);
  return new THRNullElement(data, this.globalData, this);
};

ThreeRendererBase.prototype.createShape = function (data) {
  console.log('ThreeRendererBase::createShape()', data);
  return new THRShapeElement(data, this.globalData, this);
};

ThreeRendererBase.prototype.createText = function (data) {
  console.log('ThreeRendererBase::createText()', data);
  if (!this.supports3d) {
    return new SVGTextLottieElement(data, this.globalData, this);
  }
  return new HTextElement(data, this.globalData, this);
};

ThreeRendererBase.prototype.createCamera = function (data) {
  console.log('ThreeRendererBase::createCamera()', data);
  this.camera = new THRCameraElement(data, this.globalData, this);
  return this.camera;
};

ThreeRendererBase.prototype.createVideo = function (data) {
  console.log('ThreeRendererBase::createVideo()', data);
  return new THRVideoElement(data, this.globalData, this);
};

ThreeRendererBase.prototype.createImage = function (data) {
  console.log('ThreeRendererBase::createImage()', data);
  return new THRImageElement(data, this.globalData, this);
};

ThreeRendererBase.prototype.createSolid = function (data) {
  console.log('ThreeRendererBase::createSolid()', data);
  return new THRSolidElement(data, this.globalData, this);
};

ThreeRendererBase.prototype.createNull = SVGRenderer.prototype.createNull;

ThreeRendererBase.prototype.getThreeDContainerByPos = function (pos) {
  var i = 0;
  var len = this.threeDElements.length;
  while (i < len) {
    if (this.threeDElements[i].startPos <= pos && this.threeDElements[i].endPos >= pos) {
      return this.threeDElements[i].perspectiveElem;
    }
    i += 1;
  }
  return null;
};

ThreeRendererBase.prototype.createThreeDContainer = function (pos, type) {
  var perspectiveElem = new Group();
  var container = new Group();
  if (type === '3d') {
    // style = perspectiveElem.style;
    // style.width = this.globalData.compSize.w + 'px';
    // style.height = this.globalData.compSize.h + 'px';
    // var center = '50% 50%';
    // style.webkitTransformOrigin = center;
    // style.mozTransformOrigin = center;
    // style.transformOrigin = center;
    var matrix = new Matrix4();
    matrix.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    container.applyMatrix4(matrix);
  }

  perspectiveElem.add(container);
  // this.resizerElem.appendChild(perspectiveElem);
  var threeDContainerData = {
    container: container,
    perspectiveElem: perspectiveElem,
    startPos: pos,
    endPos: pos,
    type: type,
  };
  this.threeDElements.push(threeDContainerData);
  return threeDContainerData;
};

ThreeRendererBase.prototype.build3dContainers = function () {
  var i;
  var len = this.layers.length;
  var lastThreeDContainerData;
  var currentContainer = '';
  for (i = 0; i < len; i += 1) {
    if (this.layers[i].ddd && this.layers[i].ty !== 3) {
      if (currentContainer !== '3d') {
        currentContainer = '3d';
        lastThreeDContainerData = this.createThreeDContainer(i, '3d');
      }
      lastThreeDContainerData.endPos = Math.max(lastThreeDContainerData.endPos, i);
    } else {
      if (currentContainer !== '2d') {
        currentContainer = '2d';
        lastThreeDContainerData = this.createThreeDContainer(i, '2d');
      }
      lastThreeDContainerData.endPos = Math.max(lastThreeDContainerData.endPos, i);
    }
  }
  len = this.threeDElements.length;
  for (i = len - 1; i >= 0; i -= 1) {
    this.resizerElem.add(this.threeDElements[i].perspectiveElem);
  }
};

ThreeRendererBase.prototype.addTo3dContainer = function (elem, pos) {
  var i = 0;
  var len = this.threeDElements.length;
  while (i < len) {
    if (pos <= this.threeDElements[i].endPos) {
      var j = this.threeDElements[i].startPos;
      var nextElement;
      while (j < pos) {
        if (this.elements[j] && this.elements[j].getBaseElement) {
          nextElement = this.elements[j].getBaseElement();
        }
        j += 1;
      }
      if (nextElement) {
        var layerElement = this.threeDElements[i].container;
        const elemIndex = layerElement.children.indexOf(elem);
        if (elemIndex >= 0) {
          layerElement.children.splice(elemIndex, 0, nextElement);
        } else {
          layerElement.add(elem);
        }
      } else {
        this.threeDElements[i].container.add(elem);
      }
      break;
    }
    i += 1;
  }
};

ThreeRendererBase.prototype.configAnimation = function (animData) {
  console.log('ThreeRendererBase::configAnimation()', this.globalData, animData);
  console.log('ThreeRendererBase::configAnimation() use existing', this.globalData.renderConfig.renderer);
  const globalData = this.globalData;
  let three = this.globalData.renderConfig.renderer;
  if (!three) {
    three = {};
    this.globalData.renderConfig.renderer = three;
    console.log('** creating new three instance');
  }
  if (!three.scene) {
    three.scene = new Scene();
    console.log('** creating new three scene');
  }

  if (!three.camera) {
    three.camera = new PerspectiveCamera(25, animData.w / animData.h, 0.1, 20000);
    three.camera.fov = 25;
    three.camera.focus = 10;
    three.camera.updateProjectionMatrix();
    console.log('** creating new three camera');
  }

  if (!three.renderer) {
    three.renderer = new WebGLRenderer();
    three.renderer.setPixelRatio(window.devicePixelRatio);
    three.renderer.setSize(animData.w, animData.h);
    console.log('** creating new three renderer');
  }

  // Define orbit controls as required
  if (three.controls === true) {
    three.controls = new OrbitControls(three.camera, three.renderer.domElement);
    three.controls.listenToKeyEvents(window); // optional
    console.log('** creating orbit controller');
  }

  // Define interaction manager as required
  if (three.interaction === true) {
    three.interaction = new InteractionManager(
      three.renderer,
      three.camera,
      three.renderer.domElement
    );
    console.log('** creating new interaction manager');
  }

  console.log('ThreeRendererBase::configAnimation() animData', animData, this.globalData);
  // For some reason this texture loader has to be here?!
  var textureLoader = new TextureLoader();
  textureLoader.load(`${this.globalData.renderConfig.assetsPath}${animData.assets[0].u}${animData.assets[0].p}`);

  // Position the camera and render the scene
  // TODO: Extract the camera initial position and lookAt
  // this.a = PropertyFactory.getProp(elem, data.a || { k: [0, 0, 0] }, 1, 0, this);
  // three.camera.position.set(972, 477, 2536);
  // camera.lookAt(new Vector3(977, 540, 0));

  DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };

  DefaultLoadingManager.onLoad = () => {
    console.log('Loading Complete! ');
    this.globalData.isAssetsLoaded = true;
    this.animationItem.checkLoaded();
  };

  DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };

  DefaultLoadingManager.onError = (url) => {
    console.log('There was an error loading ' + url);
  };

  var resizerElem = new Group();
  resizerElem.name = 'Resizer';

  if (this.globalData.renderConfig.renderer.scale) {
    const renderScale = this.globalData.renderConfig.renderer.scale;
    resizerElem.scale.set(renderScale, renderScale, renderScale);
  }
  // var style = resizerElem.style;
  // style.width = animData.w + 'px';
  // style.height = animData.h + 'px';
  this.resizerElem = resizerElem;
  three.scene.add(resizerElem);
  // styleDiv(resizerElem);
  // style.transformStyle = 'flat';
  // style.mozTransformStyle = 'flat';
  // style.webkitTransformStyle = 'flat';
  // if (this.renderConfig.className) {
  //   resizerElem.setAttribute('class', this.renderConfig.className);
  // }
  var wrapper = this.animationItem.wrapper || document.body;
  if (three.renderer.domElement !== wrapper) {
    wrapper.appendChild(three.renderer.domElement);
  }

  // If three.animate is defined it assumes that control of the renderer.render function and other three lifecycle
  // events is handled externally, otherwise we create a default render lifecycle here with animate.
  let stats;
  if (!three.animate) {
    if (three.debug === true) {
      stats = new Stats();
      stats.showPanel(0);
      three.stats = stats;

      document.body.appendChild(stats.dom);
      debugAnimate();
    } else {
      animate();
    }
  }

  function debugAnimate() {
    stats.begin();
    render();
    stats.end();
    requestAnimationFrame(debugAnimate);
  }

  function animate() {
    render();
    requestAnimationFrame(animate);
  }

  /**
   * Default three.js lifecycle render function.
   * Try to keep this as tight as possible for performance.
   */
  function render() {
    // Check for render override
    if (globalData.renderConfig.render) {
      globalData.renderConfig.render();
    } else {
      if (three.controls) {
        three.controls.update();
      }

      if (three.interaction) {
        three.interaction.update();
      }
      if (globalData.renderConfig.renderer.composer) {
        globalData.renderConfig.renderer.composer.render();
      } else {
        three.renderer.render(three.scene, three.camera);
      }
    }
  }

  this.data = animData;
  // Mask animation
  this.setupGlobalData(animData, document.body);
  this.layers = animData.layers;
  this.layerElement = this.resizerElem;
  this.build3dContainers();
  this.updateContainerSize();
};

ThreeRendererBase.prototype.destroy = function () {
  if (this.animationItem.wrapper) {
    this.animationItem.wrapper.innerText = '';
  }
  this.animationItem.container = null;
  this.globalData.defs = null;
  var i;
  var len = this.layers ? this.layers.length : 0;
  for (i = 0; i < len; i += 1) {
    if (this.elements[i] && this.elements[i].destroy) {
      this.elements[i].destroy();
    }
  }
  this.elements.length = 0;
  this.destroyed = true;
  this.animationItem = null;
};

ThreeRendererBase.prototype.updateContainerSize = function () {
  // console.log('updateContainerSize()', this.globalData, this.animationItem);
  if (!this.globalData.compSize || !this.resizerElem) {
    return;
  }
  var elementWidth = this.animationItem.wrapper.offsetWidth;
  var elementHeight = this.animationItem.wrapper.offsetHeight;
  var elementRel = elementWidth / elementHeight;
  var animationRel = this.globalData.compSize.w / this.globalData.compSize.h;
  var sx;
  var sy;
  var tx;
  var ty;
  if (animationRel > elementRel) {
    sx = elementWidth / (this.globalData.compSize.w);
    sy = elementWidth / (this.globalData.compSize.w);
    tx = 0;
    ty = ((elementHeight - this.globalData.compSize.h * (elementWidth / this.globalData.compSize.w)) / 2);
  } else {
    sx = elementHeight / (this.globalData.compSize.h);
    sy = elementHeight / (this.globalData.compSize.h);
    tx = (elementWidth - this.globalData.compSize.w * (elementHeight / this.globalData.compSize.h)) / 2;
    ty = 0;
  }

  // TODO: When does this happen?
  // console.log('ThreeRendererBase::updateContainerSize()', sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1);
  var matrix = new Matrix4();
  matrix.set(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1);
  // this.resizerElem.applyMatrix4(matrix);
};

ThreeRendererBase.prototype.renderFrame = function (num) {
  if (this.renderedFrame === num || this.destroyed) {
    return;
  }
  if (num === null) {
    num = this.renderedFrame;
  } else {
    this.renderedFrame = num;
  }
  // console.log('-------');
  // console.log('FRAME ',num);
  this.globalData.frameNum = num;
  this.globalData.frameId += 1;
  this.globalData.projectInterface.currentFrame = num;
  this.globalData._mdf = false;
  var i;
  var len = this.layers.length;
  if (!this.completeLayers) {
    this.checkLayers(num);
  }
  for (i = len - 1; i >= 0; i -= 1) {
    if (this.completeLayers || this.elements[i]) {
      this.elements[i].prepareFrame(num - this.layers[i].st);
    }
  }
  if (this.globalData._mdf) {
    for (i = 0; i < len; i += 1) {
      if (this.completeLayers || this.elements[i]) {
        this.elements[i].renderFrame();
      }
    }
  }
};

ThreeRendererBase.prototype.videosLoaded = function () {
  // this.trigger('loaded_images');
  // this.checkLoaded();
  console.log('ThreeRendererBase::Videos loaded!!');
};

ThreeRendererBase.prototype.initItems = function () {
  // console.log('ThreeRendererBase::initItems!!', this);
  this.buildAllItems();
  if (this.camera) {
    this.camera.setup();
  }

  // TODO: Check for video assets to preload // do this within AnimationItem
  // TODO: Detect any videos required to load but move this into AnimationItem later
  // console.log('ThreeRendererBase::Check for preload of videos..', this.animationItem.assetsPath, this.animationItem.path);
  // this.videoPreloader = new VideoPreloader();
  // this.videoPreloader.setAssetsPath(this.animationItem.assetsPath);
  // this.videoPreloader.setPath(this.animationItem.path);
  // this.videoPreloader.loadAssets(this.animationItem.animationData.assets, this.videosLoaded.bind(this));

  // else {
  //   var cWidth = this.globalData.compSize.w;
  //   var cHeight = this.globalData.compSize.h;
  //   var i;
  //   var len = this.threeDElements.length;
  //   for (i = 0; i < len; i += 1) {
  //     var style = this.threeDElements[i].perspectiveElem.style;
  //     style.webkitPerspective = Math.sqrt(Math.pow(cWidth, 2) + Math.pow(cHeight, 2)) + 'px';
  //     style.perspective = style.webkitPerspective;
  //   }
  // }
};

ThreeRendererBase.prototype.searchExtraCompositions = function (assets) {
  var i;
  var len = assets.length;
  var floatingContainer = createTag('div');
  for (i = 0; i < len; i += 1) {
    if (assets[i].xt) {
      var comp = this.createComp(assets[i], floatingContainer, this.globalData.comp, null);
      comp.initExpressions();
      this.globalData.projectInterface.registerComposition(comp);
    }
  }
};

export default ThreeRendererBase;
