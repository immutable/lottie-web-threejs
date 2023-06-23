import {
  FrontSide,
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

function THRImageElement(data, globalData, comp) {
  console.info('THRImageElement::constructor()', data, comp);
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
  // Create a plane geometry
  var textureLoader = new TextureLoader();

  // Use the preloaded image asset from the ImagePreloader
  // TODO: Compare with just loading from browser cached image asset via path (means no canvas copying to dataURI)
  var assetPath = `${this.globalData.renderConfig.assetsPath || ''}${this.assetData.u}${this.assetData.p}`;
  // const loadedAsset = this.globalData.imageLoader.getAsset(this.assetData);
  // const dataURI = ImageUtils.getDataURL(loadedAsset);
  var texture = textureLoader.load(assetPath);
  texture.encoding = sRGBEncoding;

  var material = new MeshBasicMaterial({
    map: texture,
    side: FrontSide,
    transparent: true,
    toneMapped: false,
    wireframe: false,
  });

  this.material = material;

  var geometry = new PlaneGeometry(this.assetData.w, this.assetData.h, 3, 3);
  var plane = new Mesh(geometry, material);
  plane.name = this.assetData.id;
  // plane.rotation.order = 'ZYX';

  this.baseElement.add(plane);
  this.transformedElement = plane;

  if (this.data.nm) {
    this.baseElement.name = `${this.data.nm}_pivot`;
  }
};

export default THRImageElement;
