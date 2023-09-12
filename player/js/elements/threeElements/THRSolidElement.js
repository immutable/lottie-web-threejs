import {
  Mesh, MeshBasicMaterial, PlaneGeometry,
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

function THRSolidElement(data, globalData, comp) {
  this.initElement(data, globalData, comp);
}
extendPrototype([BaseElement, TransformElement, THRBaseElement, HierarchyElement, FrameElement, RenderableObjectElement], THRSolidElement);

THRSolidElement.prototype.createContent = function () {
  // TODO: How to support mask?
  // if (this.data.hasMask) {
  //   rect = createNS('rect');
  //   rect.setAttribute('width', this.data.sw);
  //   rect.setAttribute('height', this.data.sh);
  //   rect.setAttribute('fill', this.data.sc);
  //   this.svgElement.setAttribute('width', this.data.sw);
  //   this.svgElement.setAttribute('height', this.data.sh);
  // console.log('THRSolidElement::createContent()', this.data.sc, this.data.sw, this.data.sh, this.data);
  const geometry = new PlaneGeometry(this.data.sw, this.data.sh);
  const material = new MeshBasicMaterial({ color: this.data.sc });
  this.material = material;
  const plane = new Mesh(geometry, material);
  // plane.rotation.order = 'ZYX';
  this.baseElement.add(plane);
};

export default THRSolidElement;
