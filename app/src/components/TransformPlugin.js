import { hovering } from 'components/hoverManager';

class TransformPlugin  {
   constructor() {
    this.x = 0;
    this.y = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.width = 0;
    this.height = 0;
    this.speed = 1.7;
    this.rotation = 0;
  }

  setDimensions(width, height) {
    this.setWidth(width);
    this.setHeight(height);
  }

  setWidth(width) {
    this.style.width = width + 'px';
    this.width = width;
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    this.style.opacity = opacity;
  }

  setHeight(height) {
    this.style.height = height + 'px';
    this.height = height;
  }

  setPositionOffset(offsetX, offsetY) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  moveTo(x, y, time) {
    if (!time) {
      let deltaX = this.x - x;
      let deltaY = this.y - y;
      let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      time = Math.floor(distance / this.speed);
    }

    let style = this.style;
    return new Promise((fulfill, reject) => {
      style.transition = 'transform ' + time + 'ms linear';
      this.setPosition(x, y);
      this.DOMNode.onTransitionEnd = function () {
        style.transition = '';
        fulfill();
      };
    });
  }

  updateTransformMatrix() {
    this.style.transform = 'translate3d(' + (this.x + this.offsetX) + 'px,' + (this.y + this.offsetY) + 'px,0) scale(' + this.scale + ') rotate(' + this.rotation + 'rad)';
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.updateTransformMatrix();
  }

  setScale(scale) {
    this.scale = scale;
    this.updateTransformMatrix();
  }

  setRotation(rotation) {
    this.rotation = rotation;
    this.updateTransformMatrix();
  }

  scaleTo(scale, time) {
    time = time || 200;

    this.isTransitioning = true;
    window.clearTimeout(this.transformToTimeout);
    this.style.transition = 'transform ' + time + 'ms linear';
    this.setScale(scale);

    return new Promise((resolve, reject) => {
      this.transformToTimeout = window.setTimeout(() => {
        window.clearTimeout(this.transformToTimeout);
        this.DOMNode.onTransitionEnd = null;
        this.style.transition = '';
        this.isTransitioning = false;
        resolve();
      }, time);
    });
  }

  transform(x, y, scale, rotation) {
    this.x = x;
    this.y = y;
    this.scale = scale;
    this.rotation = rotation;
    this.updateTransformMatrix();
  }

  transformTo(transform) {
    let x = transform.hasOwnProperty('x') ? transform.x : this.x;
    let y = transform.hasOwnProperty('y') ? transform.y : this.y;
    let scale = transform.hasOwnProperty('scale') ? transform.scale : this.scale;
    let rotation = transform.hasOwnProperty('rotation') ? transform.rotation : this.rotation;

    let time = transform.time;
    if (!time) {
      let deltaX = this.x - x;
      let deltaY = this.y - y;
      let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      time = Math.floor(distance / this.speed);
    }

    time = time || 100;

    this.isTransitioning = true;
    window.clearTimeout(this.transformToTimeout);

    this.style.transition = 'transform ' + time + 'ms linear';
    this.transform(x, y, scale, rotation);

    return new Promise((resolve) => {
      this.transformToTimeout = window.setTimeout(() => {
        this.style.transition = '';
        this.isTransitioning = false;
        this.transformCallback = null;
        resolve();
      }, time);
    });
  }

  show() {
    return new Promise((fulfill) => {
      this.style.display = '';
      fulfill();
    })
  }

  hide() {
    this.style.display = 'none';
  }

  setTarget(DOMNode) {
    this.DOMNode = DOMNode;
    this.style= DOMNode.style;
  }

  componentDidMount(DOMNode, reactComponent) {
    this.reactComponent = reactComponent;
    this.DOMNode = DOMNode;
    this.style = DOMNode.style;
  }

  componentWillUnmount() {
    this.DOMNode = this.style = this.reactComponent = null;
  }
}

export default TransformPlugin;
