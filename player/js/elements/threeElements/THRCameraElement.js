// import { Matrix4 } from 'three';
import { Vector3 } from 'three';
import {
  degToRads,
} from '../../utils/common';
import {
  extendPrototype,
} from '../../utils/functionExtensions';
import PropertyFactory from '../../utils/PropertyFactory';
import BaseElement from '../BaseElement';
import HierarchyElement from '../helpers/HierarchyElement';
import FrameElement from '../helpers/FrameElement';
import Matrix from '../../3rd_party/transformation-matrix';

function THRCameraElement(data, globalData, comp) {
  // console.log('THRCameraElement::constructor()', this, comp, globalData);
  this.initFrame();
  this.initBaseData(data, globalData, comp);
  this.initHierarchy();
  var getProp = PropertyFactory.getProp;
  this.pe = getProp(this, data.pe, 0, 0, this);
  if (data.ks.p.s) {
    this.px = getProp(this, data.ks.p.x, 1, 0, this);
    this.py = getProp(this, data.ks.p.y, 1, 0, this);
    this.pz = getProp(this, data.ks.p.z, 1, 0, this);
  } else {
    this.p = getProp(this, data.ks.p, 1, 0, this);
  }
  if (data.ks.a) {
    this.a = getProp(this, data.ks.a, 1, 0, this);
  }
  if (data.ks.or.k.length && data.ks.or.k[0].to) {
    var i;
    var len = data.ks.or.k.length;
    for (i = 0; i < len; i += 1) {
      data.ks.or.k[i].to = null;
      data.ks.or.k[i].ti = null;
    }
  }
  this.or = getProp(this, data.ks.or, 1, degToRads, this);
  this.or.sh = true;
  this.rx = getProp(this, data.ks.rx, 0, degToRads, this);
  this.ry = getProp(this, data.ks.ry, 0, degToRads, this);
  this.rz = getProp(this, data.ks.rz, 0, degToRads, this);
  this.mat = new Matrix();
  this._prevMat = new Matrix();
  this._isFirstFrame = true;

  // TODO: find a better way to make the HCamera element to be compatible with the LayerInterface and TransformInterface.
  this.finalTransform = {
    mProp: this,
  };
}
extendPrototype([BaseElement, FrameElement, HierarchyElement], THRCameraElement);

THRCameraElement.prototype.setup = function () {
  var i;
  var len = this.comp.threeDElements.length;
  var comp;
  // var perspectiveStyle;
  // var containerStyle;
  for (i = 0; i < len; i += 1) {
    // [perspectiveElem,container]
    comp = this.comp.threeDElements[i];
    if (comp.type === '3d') {
      // perspectiveStyle = comp.perspectiveElem.style;
      // containerStyle = comp.container.style;
      // var perspective = this.pe.v + 'px';
      // var origin = '0px 0px 0px';
      // var matrix = 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
      // perspectiveStyle.perspective = perspective;
      // perspectiveStyle.webkitPerspective = perspective;
      // containerStyle.transformOrigin = origin;
      // containerStyle.mozTransformOrigin = origin;
      // containerStyle.webkitTransformOrigin = origin;
      // perspectiveStyle.transform = matrix;
      // perspectiveStyle.webkitTransform = matrix;
      this.refresh();
    }
  }
  this.refreshListener = this.refresh.bind(this);
  window.addEventListener('resize', this.refreshListener);
};

THRCameraElement.prototype.refresh = function () {
  if (this.globalData) {
    const cameraManager = this.globalData.cameraManager;
    if (cameraManager && cameraManager.isTracking(this)) {
      // 1. Define the min and max dimensions
      let viewportWidth = this.globalData.renderConfig.renderer.viewport.width || window.innerWidth;
      let viewportHeight = this.globalData.renderConfig.renderer.viewport.height || window.innerHeight;
      const MIN_WIDTH = this.globalData.renderConfig.renderer.viewport.minWidth || viewportWidth;
      const MAX_WIDTH = this.globalData.renderConfig.renderer.viewport.maxWidth || viewportWidth;
      const MIN_HEIGHT = this.globalData.renderConfig.renderer.viewport.minHeight || viewportHeight;
      const MAX_HEIGHT = this.globalData.renderConfig.renderer.viewport.maxHeight || viewportHeight;

      // Apply bounds
      viewportWidth = Math.max(MIN_WIDTH, Math.min(viewportWidth, MAX_WIDTH));
      viewportHeight = Math.max(MIN_HEIGHT, Math.min(viewportHeight, MAX_HEIGHT));

      const aspectRatio = viewportWidth / viewportHeight;
      if (viewportWidth / aspectRatio > MAX_HEIGHT) {
        viewportWidth = MAX_HEIGHT * aspectRatio;
      } else if (viewportWidth / aspectRatio > MAX_WIDTH) {
        viewportHeight = MAX_WIDTH / aspectRatio;
      }

      // Adjust bounds based on desired aspect ratio adjustments
      if (viewportHeight < MIN_HEIGHT) {
        viewportHeight = MIN_HEIGHT;
        viewportWidth = viewportHeight * aspectRatio;
      } else if (viewportWidth < MIN_WIDTH) {
        viewportWidth = MIN_WIDTH;
        viewportHeight = viewportWidth / aspectRatio;
      }

      cameraManager.updateCameraAspect(aspectRatio);
      const renderer = this.globalData.renderConfig.renderer.renderer;
      renderer.setSize(viewportWidth, viewportHeight);

      // Reset previous transform matrix
      if (this._prevMat) {
        this._prevMat.reset();
      }
    }
  } else {
    console.warn('Camera has been detached');
  }
};

THRCameraElement.prototype.createElements = function () {
};

THRCameraElement.prototype.hide = function () {
};

THRCameraElement.prototype.renderFrame = function () {
  var _mdf = this._isFirstFrame;
  var i;
  var len;
  if (this.hierarchy) {
    len = this.hierarchy.length;
    for (i = 0; i < len; i += 1) {
      _mdf = this.hierarchy[i].finalTransform.mProp._mdf || _mdf;
    }
  }
  if (_mdf || this.pe._mdf || (this.p && this.p._mdf) || (this.px && (this.px._mdf || this.py._mdf || this.pz._mdf)) || this.rx._mdf || this.ry._mdf || this.rz._mdf || this.or._mdf || (this.a && this.a._mdf)) {
    this.mat.reset();

    if (this.hierarchy) {
      len = this.hierarchy.length - 1;
      for (i = len; i >= 0; i -= 1) {
        var mTransf = this.hierarchy[i].finalTransform.mProp;
        this.mat.translate(-mTransf.p.v[0], -mTransf.p.v[1], mTransf.p.v[2]);
        this.mat.rotateX(-mTransf.or.v[0])
          .rotateY(-mTransf.or.v[1])
          .rotateZ(mTransf.or.v[2]);
        this.mat.rotateX(-mTransf.rx.v)
          .rotateY(-mTransf.ry.v)
          .rotateZ(mTransf.rz.v);
        this.mat.scale(1 / mTransf.s.v[0], 1 / mTransf.s.v[1], 1 / mTransf.s.v[2]);
        this.mat.translate(mTransf.a.v[0], mTransf.a.v[1], mTransf.a.v[2]);
      }
    }
    if (this.p) {
      this.mat.translate(-this.p.v[0], -this.p.v[1], this.p.v[2]);
    } else {
      this.mat.translate(-this.px.v, -this.py.v, this.pz.v);
    }

    if (this.a) {
      var diffVector;
      if (this.p) {
        diffVector = [this.p.v[0] - this.a.v[0], this.p.v[1] - this.a.v[1], this.p.v[2] - this.a.v[2]];
      } else {
        diffVector = [this.px.v - this.a.v[0], this.py.v - this.a.v[1], this.pz.v - this.a.v[2]];
      }
      var mag = Math.sqrt(Math.pow(diffVector[0], 2) + Math.pow(diffVector[1], 2) + Math.pow(diffVector[2], 2));
      // var lookDir = getNormalizedPoint(getDiffVector(this.a.v,this.p.v));
      var lookDir = [diffVector[0] / mag, diffVector[1] / mag, diffVector[2] / mag];
      var lookLengthOnXZ = Math.sqrt(lookDir[2] * lookDir[2] + lookDir[0] * lookDir[0]);
      var mRotationX = (Math.atan2(lookDir[1], lookLengthOnXZ));
      var mRotationY = (Math.atan2(lookDir[0], -lookDir[2]));
      this.mat.rotateY(mRotationY)
        .rotateX(-mRotationX);
    }
    this.mat.rotateX(-this.rx.v)
      .rotateY(-this.ry.v)
      .rotateZ(this.rz.v);
    this.mat.rotateX(-this.or.v[0])
      .rotateY(-this.or.v[1])
      .rotateZ(this.or.v[2]);
    this.mat.translate(this.globalData.compSize.w / 2, this.globalData.compSize.h / 2, 0);
    this.mat.translate(0, 0, this.pe.v);

    const cameraManager = this.globalData.cameraManager;
    if (cameraManager && cameraManager.isTracking(this)) {
      const camera = cameraManager.getActiveCamera(); // this.globalData.renderConfig.renderer.camera;
      const renderScale = this.globalData.renderConfig.renderer.scale || 1.0;
      // console.log('THRCameraElement::renderFrame()', renderScale, this.globalData.renderConfig);
      var hasMatrixChanged = !this._prevMat.equals(this.mat);
      if ((hasMatrixChanged || this.pe._mdf) && this.comp.threeDElements) {
        len = this.comp.threeDElements.length;
        var comp;
        // var perspectiveStyle;
        // var containerStyle;
        for (i = 0; i < len; i += 1) {
          comp = this.comp.threeDElements[i];
          if (comp.type === '3d') {
            if (hasMatrixChanged) {
              const newPosition = new Vector3();
              if (this.p) {
                newPosition.set(
                  this.p.v[0] * renderScale,
                  -this.p.v[1] * renderScale,
                  -this.p.v[2] * renderScale
                );
              } else {
                newPosition.set(
                  this.px.v * renderScale,
                  -this.py.v * renderScale,
                  -this.pz.v * renderScale
                );
              }
              camera.position.copy(newPosition);

              // Camera Adjustments
              // console.log('Camera::renderFrame()', this);
              const cameraModifier = this.globalData.renderConfig.renderer.cameraModifier;
              if (cameraModifier) {
                if (cameraModifier.position) {
                  camera.position.add(cameraModifier.position);
                }
              }

              // LookAt
              if (this.a) {
                const cameraLookAt = new Vector3(this.a.v[0], -this.a.v[1], -this.a.v[2]);
                camera.lookAt(cameraLookAt);
              }
            }
            if (this.pe._mdf) {
              // console.log('comp.perspectiveElem', comp.perspectiveElem);
              // perspectiveStyle = comp.perspectiveElem.style;
              // perspectiveStyle.perspective = this.pe.v + 'px';
              // perspectiveStyle.webkitPerspective = this.pe.v + 'px';
            }
          }
        }
        this.mat.clone(this._prevMat);
      }
    }
  }
  this._isFirstFrame = false;
};

THRCameraElement.prototype.prepareFrame = function (num) {
  this.prepareProperties(num, true);
};

THRCameraElement.prototype.destroy = function () {
  window.removeEventListener('resize', this.refreshListener);
};
THRCameraElement.prototype.getBaseElement = function () { return null; };

export default THRCameraElement;

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
//   // const g = matrix.props[8] / sz;
//   // const h = matrix.props[9] / sz;
//   // const i = matrix.props[10] / sz;
//
//   // Compute the Euler angles
//   const xRot = Math.atan2(f, e);
//   const yRot = Math.atan2(-d, Math.sqrt(a * a + b * b));
//   const zRot = Math.atan2(c, a);
//
//   return {
//     tx, ty, tz, sx, sy, sz, xRot, yRot, zRot,
//   };
// }
