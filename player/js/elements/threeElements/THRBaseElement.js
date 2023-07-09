import {
  AdditiveBlending, MultiplyBlending,
  Object3D, Vector3,
} from 'three';
import BaseRenderer from '../../renderers/BaseRenderer';
import SVGBaseElement from '../svgElements/SVGBaseElement';
import PropertyFactory from '../../utils/PropertyFactory';
import { degToRads } from '../../utils/common';
import TransformElement from '../helpers/TransformElement';
import THRMaskElement from './THRMaskElement';
import getBlendMode from '../../utils/helpers/blendModes';

function THRBaseElement() {}
THRBaseElement.prototype = {
  checkBlendMode: function () {},
  initRendererElement: function () {
    this.material = null;
    this.baseElement = new Object3D(); // This base element acts as an anchor/pivot point as required

    this.pivotElement = new Object3D();
    this.baseElement.add(this.pivotElement);
    // this.baseElement.rotation.order = 'ZYX';

    // Create a red cube
    // const cubeSize = 100;
    // const geometry = new BoxGeometry(cubeSize, cubeSize, cubeSize); // dimensions of the cube
    // const material = new MeshBasicMaterial({ color: 0xff0000 }); // red color
    // const cube = new Mesh(geometry, material);
    // this.baseElement.add(cube);
    this.assetData = this.globalData.getAssetData(this.data.refId);
    if (this.data.hasMask) {
      // TODO: setup mask support
    }
    this.layerElement = this.baseElement;
  },
  createContainerElements: function () {
    // console.log('THRBaseElement::createContainerElements()', this.data.bm);
    // this.renderableEffectsManager = new CVEffects(this);
    // this.baseElement;
    this.maskedElement = this.layerElement;
    // if (this.data.nm) {
    //   this.baseElement.name = `${this.data.nm}_pivot`;
    // }
    if (this.data.bm !== 0) {
      this.setBlendMode();
    }
  },
  setBlendMode: function () {
    var blendModeValue = getBlendMode(this.data.bm);
    var material = this.material;
    if (material) {
      switch (blendModeValue) {
        case 'add':
        case 'lighten':
          material.blending = AdditiveBlending;
          material.needsUpdate = true;
          break;

        case 'multiply':
          material.blending = MultiplyBlending;
          material.needsUpdate = true;
          break;

          // case 'lighten':
          //   material = new ShaderMaterial({
          //     map: material.texture,
          //     transparent: true,
          //     toneMapped: false,
          //     side: FrontSide,
          //     uniforms: {
          //       map: { value: material.map },
          //       blend: { value: null },
          //     },
          //     vertexShader: `
          //       varying vec2 vUv;
          //       void main () {
          //         vUv = uv;
          //         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          //       }
          //     `,
          //     fragmentShader: `
          //       varying vec2 vUv;
          //       uniform sampler2D map;
          //       uniform sampler2D blend;
          //
          //       void main () {
          //         vec4 base = texture2D(map, vUv);
          //         gl_FragColor = base;
          //
          //         // Encodings
          //         gl_FragColor = linearToOutputTexel(gl_FragColor);
          //
          //         // Get normal blending with premultipled, use with CustomBlending, OneFactor, OneMinusSrcAlphaFactor, AddEquation.
          //         gl_FragColor.rgb *= gl_FragColor.a;
          //       }
          //     `,
          //   });
          //   material.blending = AdditiveBlending;
          //   material.needsUpdate = true;
          //   break;

        default:
          console.log('THRBaseElement::setBlendMode() no blend:', this.data.bm, blendModeValue);
          break;
      }
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
    if (data.rx) {
      this.rx = PropertyFactory.getProp(elem, data.rx, 0, degToRads, this);
      this.ry = PropertyFactory.getProp(elem, data.ry, 0, degToRads, this);
      this.rz = PropertyFactory.getProp(elem, data.rz, 0, degToRads, this);
      if (data.or.k[0].ti) {
        var i;
        var len = data.or.k.length;
        for (i = 0; i < len; i += 1) {
          data.or.k[i].to = null;
          data.or.k[i].ti = null;
        }
      }
      this.or = PropertyFactory.getProp(elem, data.or, 1, degToRads, this);
      // sh Indicates it needs to be capped between -180 and 180
      this.or.sh = true;
    } else {
      this.r = PropertyFactory.getProp(elem, data.r || { k: 0 }, 0, degToRads, this);
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
      // Euler.order
      // const mat = new Matrix4().fromArray(this.finalTransform.mat.props);
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

      // Scale
      let scaleX = 1;
      let scaleY = 1;
      let scaleZ = 1;
      if (this.s) {
        scaleX = this.s.v[0];
        scaleY = this.s.v[1];
        scaleZ = this.s.v[2];
        this.transformedElement.scale.set(scaleX, scaleY, scaleZ);
      }

      // Anchor / Pivot
      if (this.a) {
        const pivotOffset = new Vector3(
          -(this.a.v[0]),
          (this.a.v[1]),
          (this.a.v[2])
        );
        this.pivotElement.position.copy(pivotOffset);
      }

      if (this.p) {
        const newPosition = new Vector3(this.p.v[0], -this.p.v[1], -this.p.v[2]);
        newPosition.x += ((this.assetData.w * 0.5) * scaleX);
        newPosition.y -= ((this.assetData.h * 0.5) * scaleY);
        this.transformedElement.position.copy(newPosition);
      }

      // Skew
      // if (this.sk) {
      //   console.log('Skew is', -this.sk.v, this.sa.v);
      //
      //   var matrix = new Matrix4();
      //   matrix.makeRotationAxis(-this.sk.v, this.sa.v);
      //   this.transformedElement.matrixAutoUpdate = false;
      //   this.transformedElement.matrix.applyMatrix4(matrix); // .set(...matrix);
      //   this.transformedElement.updateMatrixWorld(true);
      // }

      // Rotation
      // if (this.r) {
      //   // TODO: Look at working vector in
      //   // this.transformedElement.rotate(-this.r.v);
      // } else if (!this.r) {
      //   this.transformedElement.rotation.z += -this.rz.v;
      //   this.transformedElement.rotation.y += this.ry.v;
      //   this.transformedElement.rotation.x += this.rx.v;
      //   this.transformedElement.rotation.z += -this.or.v[2];
      //   this.transformedElement.rotation.y += this.or.v[1];
      //   this.transformedElement.rotation.x += this.or.v[0];
      // }

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

      if (this.helper) {
        this.helper.update();
      }
    }

    // Opacity
    if (this.finalTransform._opMdf && this.material) {
      this.material.opacity = this.finalTransform.mProp.o.v;
    }
    // TODO: Review renderTransform??
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
  hide: function () {
    // console.log('HIDE', this);
    if (!this.hidden && (!this.isInRange || this.isTransparent)) {
      var elem = this.baseElement || this.layerElement;
      elem.visible = false;
      this.hidden = true;
    }
  },
  show: function () {
    // console.log('SHOW', this);
    if (this.isInRange && !this.isTransparent) {
      if (!this.data.hd) {
        var elem = this.baseElement || this.layerElement;
        elem.visible = true;
      }
      this.hidden = false;
      this._isFirstFrame = true;
    }
  },
};
THRBaseElement.prototype.getBaseElement = SVGBaseElement.prototype.getBaseElement;
THRBaseElement.prototype.destroyBaseElement = THRBaseElement.prototype.destroy;
THRBaseElement.prototype.buildElementParenting = BaseRenderer.prototype.buildElementParenting;

// function skewFromAxis(ax, angle) {
//   var mCos = Math.cos(angle);
//   var mSin = Math.sin(angle);
//
//   // Assuming _t() function returns an array representing a 4x4 matrix
//   var matrix = Matrix4.fromArray(mCos, mSin, 0, 0, -mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
//     ._t(1, 0, 0, 0, Math.tan(ax), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
//     ._t(mCos, -mSin, 0, 0, mSin, mCos, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
//
//   return matrix;
// }

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
