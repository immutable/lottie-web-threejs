/* global */

import MaskElement from '../../mask';
import { createSizedArray } from '../../utils/helpers/arrays';
import ShapePropertyFactory from '../../utils/shapes/ShapeProperty';

function THRMaskElement(data, element) {
  this.data = data;
  this.element = element;
  this.masksProperties = this.data.masksProperties || [];
  this.viewData = createSizedArray(this.masksProperties.length);
  var i;
  var len = this.masksProperties.length;
  var hasMasks = false;
  for (i = 0; i < len; i += 1) {
    if (this.masksProperties[i].mode !== 'n') {
      hasMasks = true;
    }
    this.viewData[i] = ShapePropertyFactory.getShapeProp(this.element, this.masksProperties[i], 3);
  }
  this.hasMasks = hasMasks;
  if (hasMasks) {
    console.log('THRMaskElement::', hasMasks);
    // this.element.addRenderableComponent(this);
  }
}

THRMaskElement.prototype.renderFrame = function () {
  if (!this.hasMasks) {
    // return;
  }
};

THRMaskElement.prototype.getMaskProperty = MaskElement.prototype.getMaskProperty;

THRMaskElement.prototype.destroy = function () {
};

export default THRMaskElement;
