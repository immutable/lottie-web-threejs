import {
  Group,
} from 'three';
import BaseRenderer from '../../renderers/BaseRenderer';
import SVGBaseElement from '../svgElements/SVGBaseElement';
import PropertyFactory from '../../utils/PropertyFactory';
import { degToRads } from '../../utils/common';
import TransformElement from '../helpers/TransformElement';
import THRMaskElement from './THRMaskElement';

function THRBaseElement() {}
THRBaseElement.prototype = {
  checkBlendMode: function () {},
  initRendererElement: function () {
    this.baseElement = new Group(); // this.data.tg
    if (this.data.hasMask) {
      // TODO: setup mask support
    }
    this.layerElement = this.baseElement;
  },
  createContainerElements: function () {
    // this.renderableEffectsManager = new CVEffects(this);
    this.transformedElement = this.baseElement;
    this.maskedElement = this.layerElement;
    if (this.data.ln) {
      this.baseElement.name = this.data.ln;
    }
    if (this.data.bm !== 0) {
      this.setBlendMode();
    }
  },
  initTransform: function () {
    TransformElement.prototype.initTransform.call(this);

    const elem = this;
    const data = this.data.ks;
    if (data.p && data.p.s) {
      this.px = PropertyFactory.getProp(elem, data.p.x, 0, 0, this);
      this.py = PropertyFactory.getProp(elem, data.p.y, 0, 0, this);
      if (data.p.z) {
        this.pz = PropertyFactory.getProp(elem, data.p.z, 0, 0, this);
      }
    } else {
      this.p = PropertyFactory.getProp(elem, data.p || { k: [0, 0, 0] }, 1, 0, this);
    }

    if (data.sk) {
      this.sk = PropertyFactory.getProp(elem, data.sk, 0, degToRads, this);
      this.sa = PropertyFactory.getProp(elem, data.sa, 0, degToRads, this);
    }
    this.a = PropertyFactory.getProp(elem, data.a || { k: [0, 0, 0] }, 1, 0, this);
    this.s = PropertyFactory.getProp(elem, data.s || { k: [100, 100, 100] }, 1, 0.01, this);
  },
  renderElement: function () {
    // console.log('THRBaseElement::renderElement()', this.finalTransform._matMdf, this.baseElement);
    var transformedElement = this.transformedElement;
    if (transformedElement && this.finalTransform._matMdf) {
      // var matrix = new Matrix4();
      // matrix.set(...this.finalTransform.mat.props);
      // transformedElement.applyMatrix4(matrix);

      // const {
      //   tx, ty, tz, sx, sy, sz, // xRot, yRot, zRot,
      // } = decomposeMatrix(this.finalTransform.mat);
      // const pivot3d = new Point3d();
      //
      // // Calculate the pivot3d values
      // pivot3d.x = -(Math.sin(yRot) * Math.sin(zRot) + Math.cos(xRot) * Math.cos(zRot) * Math.sin(yRot)) * sx;
      // pivot3d.y = (Math.sin(xRot) * Math.sin(yRot) * Math.cos(zRot) - Math.cos(xRot) * Math.sin(zRot)) * sy;
      // pivot3d.z = (Math.cos(yRot) * Math.cos(zRot)) * sz;
      // this.transformedElement.pivot3d.set(pivot3d.x, pivot3d.y, pivot3d.z);

      // const [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4] = this.finalTransform.mat.props;

      // Create a ThreeJS matrix
      // const decomposed = decomposeMatrix(this.finalTransform.mat.props);
      // const matrix = lottieMatrixToThreeMatrix(this.finalTransform.mat.props);
      // const matrix = new Matrix4().fromArray(this.finalTransform.mat.props);
      // Apply
      // const mat = new Matrix4();
      // if (this.a) {
      //   mat.makeTranslation(-this.a.v[0], -this.a.v[1], this.a.v[2]);
      // }
      // if (this.s) {
      //   mat.makeScale(this.s.v[0], this.s.v[1], this.s.v[2]);
      // }
      // if (this.sk) {
      //   // mat.skewFromAxis(-this.sk.v, this.sa.v);
      // }
      // if (data.p.s) {
      //   if (data.p.z) {
      //     mat.makeTranslation(this.px.v, this.py.v, -this.pz.v);
      //   } else {
      //     mat.makeTranslation(this.px.v, this.py.v, 0);
      //   }
      // } else {
      //   mat.makeTranslation(this.p.v[0], this.p.v[1], -this.p.v[2]);
      // }
      // this.transformedElement.applyMatrix4(mat);

      if (this.s) {
        this.transformedElement.scale.set(this.s.v[0], this.s.v[1], this.s.v[2]);
      }
      // if (this.sk) {
      //   console.log('**** Need to skew from axis', this.sk, this);
      //   // mat.skewFromAxis(-this.sk.v, this.sa.v);
      // }

      // Position
      const data = this.data.ks;
      if (data.p.s) {
        if (data.p.z) {
          this.transformedElement.position.set(this.px.v, this.py.v, -this.pz.v);
        } else {
          this.transformedElement.position.set(this.px.v, this.py.v, 0);
        }
      } else {
        this.transformedElement.position.set(this.p.v[0], this.p.v[1], -this.p.v[2]);
      }

      // console.log('Found prop', this.data.nm, this, this.px, this.py, this.pz, this.p);
      // if (this.data.ddd) {
      //   // 3d
      // } else {
      // }
      // Set the elements of the matrix using the values from the matrix3d function
      // matrix.set(a1, b1, c1, d1,
      //   a2, b2, c2, d2,
      //   a3, b3, c3, d3,
      //   a4, b4, c4, d4,
      //   0, 0, 0, 1);

      // Apply transformations in reverse order
      // matrix.makeTranslation(a4, b4, c4);
      // matrix.multiply(new Matrix4().makeScale(a1 / 100, a2 / 100, a3 / 100));
      // matrix.multiply(new Matrix4().makeRotationZ(-Math.atan2(b1, a1)));
      // matrix.multiply(new Matrix4().makeRotationY(Math.atan2(c, a));
      // matrix.multiply(new Matrix4().makeRotationX(Math.atan2(g, j)));

      // console.log('Matrix decompose', decomposed, matrix);
      // console.log('Matrix translate', a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4, this.data);
      // const matrix = lottieToThreeMatrix(this.finalTransform.mat);
      // this.transformedElement.applyMatrix4(matrix);
      // decomposed.translation.x = -decomposed.translation.x;
      // this.transformedElement.scale.copy(decomposed.scale);
      // this.transformedElement.position.copy(decomposed.translation);
      // this.transformedElement.quaternion.copy(decomposed.quaternion);

      // this.transformedElement.matrix.copy(matrix);
      // this.transformedElement.matrixAutoUpdate = false;
      // this.transformedElement.scale.set(a / 100, e / 100, i / 100);
      // const matProps = this.finalTransform.mat.props;
      // const matrix = new Matrix(
      //   matProps[0],
      //   matProps[1],
      //   matProps[4],
      //   matProps[5],
      //   matProps[12],
      //   matProps[13]
      // );
      // console.log('renderElement >> ', this.finalTransform.mat.props, transformedElement);
    }
    if (this.finalTransform._opMdf) {
      // transformedElementStyle.opacity = this.finalTransform.mProp.o.v;
      // TODO: Get the mesh.material and apply opacity
    }
  },
  renderFrame: function () {
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
  },
  destroy: function () {
    this.layerElement = null;
    this.transformedElement = null;
    if (this.matteElement) {
      this.matteElement = null;
    }
    if (this.maskManager) {
      this.maskManager.destroy();
      this.maskManager = null;
    }
  },
  createRenderableComponents: function () {
    this.maskManager = new THRMaskElement(this.data, this, this.globalData);
  },
  addEffects: function () {
  },
  setMatte: function () {},
};
THRBaseElement.prototype.getBaseElement = SVGBaseElement.prototype.getBaseElement;
THRBaseElement.prototype.destroyBaseElement = THRBaseElement.prototype.destroy;
THRBaseElement.prototype.buildElementParenting = BaseRenderer.prototype.buildElementParenting;

// function decomposeMatrix(matrix) {
//   // Extract the translation values
//   const tx = matrix.props[12];
//   const ty = matrix.props[13];
//   const tz = matrix.props[14];
//
//   // Extract the scaling values
//   const sx = Math.sqrt(matrix.props[0] * matrix.props[0] + matrix.props[1] * matrix.props[1] + matrix.props[2] * matrix.props[2]);
//   const sy = Math.sqrt(matrix.props[4] * matrix.props[4] + matrix.props[5] * matrix.props[5] + matrix.props[6] * matrix.props[6]);
//   const sz = Math.sqrt(matrix.props[8] * matrix.props[8] + matrix.props[9] * matrix.props[9] + matrix.props[10] * matrix.props[10]);
//
//   // Normalize the matrix
//   const a = matrix.props[0] / sx;
//   const b = matrix.props[1] / sx;
//   const c = matrix.props[2] / sx;
//   const d = matrix.props[4] / sy;
//   const e = matrix.props[5] / sy;
//   const f = matrix.props[6] / sy;
//
//   // Compute the Euler angles
//   const xRot = Math.atan2(f, e);
//   const yRot = Math.atan2(-d, Math.sqrt(a * a + b * b));
//   const zRot = Math.atan2(c, a);
//
//   // Convert Euler angles to quaternion
//   const quaternion = new Quaternion().setFromEuler(new Euler(xRot, yRot, zRot));
//
//   return {
//     translation: new Vector4(tx, ty, tz),
//     scale: new Vector4(sx, sy, sz),
//     rotation: quaternion,
//   };
// }

// function decomposeLottieMatrix(lottieMatrix) {
//   const decomposed = {
//     translation: new Vector4(),
//     rotation: new Quaternion(),
//     scale: new Vector4(),
//   };
//
//   const m = new Matrix4().fromArray(lottieMatrix);
//
//   m.decompose(decomposed.translation, decomposed.rotation, decomposed.scale);
//
//   return decomposed;
// }

// function lottieMatrixToThreeMatrix(lottieMatrix) {
//   // Transpose the Lottie matrix to match Three.js matrix format
//   const threeMatrix = [
//     lottieMatrix[0], lottieMatrix[4], lottieMatrix[8], lottieMatrix[12],
//     lottieMatrix[1], lottieMatrix[5], lottieMatrix[9], lottieMatrix[13],
//     lottieMatrix[2], lottieMatrix[6], lottieMatrix[10], lottieMatrix[14],
//     lottieMatrix[3], lottieMatrix[7], lottieMatrix[11], lottieMatrix[15],
//   ];
//
//   // Create a Three.js Matrix4 object
//   const matrix = new Matrix4();
//   matrix.fromArray(threeMatrix);
//
//   return matrix;
// }

// function lottieToThreeMatrix(lottieMatrix) {
//   const a = lottieMatrix[0][0];
//   const b = lottieMatrix[1][0];
//   const c = lottieMatrix[0][1];
//   const d = lottieMatrix[1][1];
//   const tx = lottieMatrix[0][2];
//   const ty = lottieMatrix[1][2];
//   const tz = lottieMatrix[2][2];
//   const m = new Matrix4();
//   m.set(a, c, 0, 0, b, d, 0, 0, 0, 0, tz, 0, tx, ty, 0, 1);
//   return m;
// }

export default THRBaseElement;
