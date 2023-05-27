import {
  DoubleSide,
  Mesh, MeshBasicMaterial, PlaneGeometry, sRGBEncoding, TextureLoader,
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
import getBlendMode from '../../utils/helpers/blendModes';
import { VERSION } from '../../renderers/version';

function THRImageElement(data, globalData, comp) {
  console.info('THRImageElement::constructor()', VERSION);
  this.assetData = globalData.getAssetData(data.refId);
  this.initElement(data, globalData, comp);
}

extendPrototype([BaseElement, TransformElement, THRBaseElement, HierarchyElement, FrameElement, RenderableObjectElement], THRImageElement);

// THRImageElement.prototype.initElement = RenderableObjectElement.prototype.initElement;
THRImageElement.prototype.setBlendMode = function () {
  var blendModeValue = getBlendMode(this.data.bm);
  var elem = this.baseElement || this.layerElement;

  console.log('THRImageElement::Setup blend mode', blendModeValue, this.data.bm, elem);
};

THRImageElement.prototype.createContent = function () {
  var assetPath = `${this.globalData.renderConfig.assetsPath}${this.assetData.u}${this.assetData.p}`;

  // Create a plane geometry
  var geometry = new PlaneGeometry(this.assetData.w, this.assetData.h);

  // Load the PNG image as a texture
  var textureLoader = new TextureLoader();

  console.log('THRImageElement::createContent()', assetPath, this.assetData, textureLoader);
  console.log('THRImageElement::loading()', this.globalData.renderConfig.assetsPath);
  var texture = textureLoader.load(assetPath);
  // texture.colorSpace = LinearSRGBColorSpace;
  texture.encoding = sRGBEncoding;
  var material = new MeshBasicMaterial({
    map: texture,
    side: DoubleSide,
    transparent: true,
    toneMapped: false,
  });

  // material.needsUpdate();
  this.material = material;
  var plane = new Mesh(geometry, material);
  plane.rotation.order = 'ZYX';

  // console.log('THRImageElement::Assets loading >>>', `${assetPath}`, texture, this.layerElement, this.assetData);
  // if (this.data.hasMask) {
  //   this.imageElem = createNS('image');
  //   this.imageElem.setAttribute('width', this.assetData.w + 'px');
  //   this.imageElem.setAttribute('height', this.assetData.h + 'px');
  //   this.imageElem.setAttributeNS('http://www.w3.org/1999/xlink', 'href', assetPath);
  //   this.layerElement.appendChild(this.imageElem);
  //   this.baseElement.setAttribute('width', this.assetData.w);
  //   this.baseElement.setAttribute('height', this.assetData.h);
  // } else {
  this.layerElement.add(plane);

  if (this.data.ln) {
    this.baseElement.name = this.data.ln;
  }
};

export default THRImageElement;
