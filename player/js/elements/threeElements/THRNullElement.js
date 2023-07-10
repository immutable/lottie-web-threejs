import {
  AxesHelper,
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

function THRNullElement(data, globalData, comp) {
  console.info('THRNullElement::constructor()', data, comp);
  this.assetData = globalData.getAssetData(data.refId);
  this.initElement(data, globalData, comp);
  this.initRendererElement();
  this.createContent();
}

extendPrototype([BaseElement, TransformElement, THRBaseElement, HierarchyElement, FrameElement, RenderableObjectElement], THRNullElement);

THRNullElement.prototype.createContent = function () {
  // console.log('THRNullElement::createContent() data:', this.assetData, this.assetData.w, this.assetData.h);
  const pivotDebug = new AxesHelper(50);
  pivotDebug.name = `${this.assetData.id}_axes`;
  this.pivotElement.add(pivotDebug);

  this.transformedElement = this.baseElement;

  if (this.data.nm) {
    this.baseElement.name = `${this.data.nm}`;
    this.pivotElement.name = `${this.data.nm}_pivot`;
  }
};

export default THRNullElement;
