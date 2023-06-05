import {
  extendPrototype,
} from '../../utils/functionExtensions';
import {
  createSizedArray,
} from '../../utils/helpers/arrays';
import PropertyFactory from '../../utils/PropertyFactory';
import ICompElement from '../CompElement';
import THRBaseElement from './THRBaseElement';
import ThreeRendererBase from '../../renderers/ThreeRendererBase';

function THRCompElement(data, globalData, comp) {
  console.log('THRCompElement', data, globalData, comp);
  this.layers = data.layers;
  this.supports3d = !data.hasMask;
  this.completeLayers = false;
  this.pendingElements = [];
  this.elements = this.layers ? createSizedArray(this.layers.length) : [];
  this.initElement(data, globalData, comp);
  this.tm = data.tm ? PropertyFactory.getProp(this, data.tm, 0, globalData.frameRate, this) : { _placeholder: true };
}

extendPrototype([ThreeRendererBase, ICompElement, THRBaseElement], THRCompElement);
THRCompElement.prototype._createBaseContainerElements = THRCompElement.prototype.createContainerElements;

THRCompElement.prototype.createContainerElements = function () {
  this._createBaseContainerElements();
  // divElement.style.clip = 'rect(0px, '+this.data.w+'px, '+this.data.h+'px, 0px)';
  // if (this.data.hasMask) {
  //   this.svgElement.setAttribute('width', this.data.w);
  //   this.svgElement.setAttribute('height', this.data.h);
  //   this.transformedElement = this.baseElement;
  // } else {
  //   this.transformedElement = this.layerElement;
  // }
  // TODO: Define the mask
  // this.transformedElement = this.baseElement;
};

THRCompElement.prototype.addTo3dContainer = function (elem, pos) {
  var j = 0;
  var nextElement;
  while (j < pos) {
    if (this.elements[j] && this.elements[j].getBaseElement) {
      nextElement = this.elements[j].getBaseElement();
    }
    j += 1;
  }
  if (nextElement) {
    const elemIndex = this.layerElement.children.indexOf(elem);
    if (elemIndex >= 0) {
      this.layerElement.children.splice(elemIndex, 0, nextElement);
    } else {
      this.layerElement.add(elem);
    }
  } else {
    this.layerElement.add(elem);
  }
};

THRCompElement.prototype.createComp = function (data) {
  return new THRCompElement(data, this.globalData, this);
};

export default THRCompElement;
