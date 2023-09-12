const CameraManager = (function () {
  // function cameraEvent(event) {
  //   console.log('VideoPreloader::videoEvent()', event.type, event);
  // }

  function getCameras() {
    return this.cameras;
  }

  function resetCameraElement() {
    this.activeCameraElement = null;
  }

  function trackCameraElement(name) {
    const cameraData = this.cameras.find((item) => item.layer.nm === name);
    if (cameraData) {
      this.activeCameraElement = cameraData.element;
      this.activeCameraElement.refresh();
      this.activeCameraElement.renderFrame();
    }

    return cameraData;
  }

  function trackCameraElementByLayer(layer) {
    const cameraData = this.cameras.find((item) => item.layer === layer);
    if (cameraData) {
      this.activeCameraElement = cameraData.element;
      this.activeCameraElement.refresh();
      this.activeCameraElement.renderFrame();
    }
  }

  /**
   * Adds a Lottie layer and Camera Element used for tracking to a renderer camera instance as activeCamera.
   * @param layer
   * @param element
   */
  function addCameraElement(layer, element) {
    // console.log('CameraManager::AddCamera()', layer, element);
    this.cameras.push({
      layer,
      element,
    });

    if (this.cameras.length === 1) {
      this.trackCameraElementByLayer(layer);
    }
  }

  function isTracking(element) {
    return (this.activeCameraElement === element);
  }

  /**
   * Sets the renderer camera. Any Lottie camera layer can be used to update the renderer camera by using:
   * trackCameraElementByLayer or trackCameraElement
   */
  function setActiveCamera(camera) {
    this.activeCamera = camera;
  }

  function getActiveCamera() {
    return this.activeCamera;
  }

  function getActiveCameraElement() {
    return this.activeCameraElement;
  }

  function updateCameraAspect(aspect) {
    if (this.activeCamera) {
      const camera = this.activeCamera;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }
  }

  function destroy() {
    this.cameras.length = 0;
  }

  function CameraManagerFactory() {
    this.activeCameraElement = null; // Used for tracking to a renderer camera
    this.activeCamera = null;
    this.cameras = [];
  }

  CameraManagerFactory.prototype = {
    setActiveCamera,
    getCameras,
    getActiveCamera,
    getActiveCameraElement,
    isTracking,
    addCameraElement,
    updateCameraAspect,
    resetCameraElement,
    trackCameraElement,
    trackCameraElementByLayer,
    destroy,
  };

  return CameraManagerFactory;
}());

export default CameraManager;
