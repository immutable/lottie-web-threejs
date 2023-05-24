import {
  Mesh, MeshBasicMaterial, PlaneGeometry, RGBAFormat, TextureLoader, VideoTexture, LinearFilter,
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

function THRVideoElement(data, globalData, comp) {
  this.assetData = globalData.getAssetData(data.refId);
  this.initElement(data, globalData, comp);
}

extendPrototype([BaseElement, TransformElement, THRBaseElement, HierarchyElement, FrameElement, RenderableObjectElement], THRVideoElement);

// THRVideoElement.prototype.initElement = RenderableObjectElement.prototype.initElement;

THRVideoElement.prototype.createContent = function () {
  var assetPath = `${this.globalData.renderConfig.assetsPath}${this.assetData.u}${this.assetData.p}`;

  var video = document.createElement('video');
  video.src = assetPath;
  video.load(); // must call after setting/changing source
  video.play();

  // Create a plane geometry
  var geometry = new PlaneGeometry(this.assetData.w, this.assetData.h);

  // Load the PNG image as a texture
  var textureLoader = new TextureLoader();

  console.log('THRVideoElement::createContent()', assetPath, this.assetData, textureLoader);
  console.log('THRVideoElement::loading()', this.globalData.renderConfig.assetsPath);
  // var texture = textureLoader.load(assetPath);
  var texture = new VideoTexture(video);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.format = RGBAFormat;

  var material = new MeshBasicMaterial({
    map: texture,
    transparent: true,
    toneMapped: false,
  });
  this.material = material;
  var plane = new Mesh(geometry, material);
  plane.rotation.order = 'ZYX';

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
  this.layerElement.add(plane);

  if (this.data.ln) {
    this.baseElement.name = this.data.ln;
  }
};

export default THRVideoElement;
