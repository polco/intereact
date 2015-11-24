import { EventEmitter } from 'events';
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
    this.speed = 1;
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

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.style.transform = 'translate3d(' + (x + this.offsetX) + 'px,' + (y + this.offsetY) + 'px,0) scale(' + this.scale + ')';
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

  setScale(scale) {
    this.scale = scale;
    this.style.transform = 'translate3d(' + (this.x + this.offsetX) + 'px,' + (this.y + this.offsetY) + 'px,0) scale(' + scale + ')';
  }

  scaleTo(scale, time) {
    time = time || 200;

    this.isTransitioning = true;
    window.clearTimeout(this.transformToTimeout);
    this.DOMNode.onTransitionEnd = null;
    this.style.transition = 'transform ' + time + 'ms linear';
    this.setScale(scale);

    return new Promise((resolve, reject) => {
      const onTransitionEnd = () => {
        window.clearTimeout(this.transformToTimeout);
        this.DOMNode.onTransitionEnd = null;
        this.style.transition = '';
        this.isTransitioning = false;
        resolve();
      }

      this.transformToTimeout = window.setTimeout(onTransitionEnd, time);
      this.DOMNode.onTransitionEnd = onTransitionEnd;
    });
  }

  transform(x, y, scale) {
    this.setPosition(x, y);
    this.setScale(scale);
  }

  transformTo(transform) {
    let x = transform.hasOwnProperty('x') ? transform.x : this.x;
    let y = transform.hasOwnProperty('y') ? transform.y : this.y;
    let scale = transform.hasOwnProperty('scale') ? transform.scale : this.scale;

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
    this.DOMNode.onTransitionEnd = null;

    this.style.transition = 'transform ' + time + 'ms linear';
    this.transform(x, y, scale);

    return new Promise((resolve) => {
      const onTransitionEnd = () => {
        window.clearTimeout(this.transformToTimeout);
        this.DOMNode.onTransitionEnd = null;
        this.style.transition = '';
        this.isTransitioning = false;
        resolve();
      }

      this.transformToTimeout = window.setTimeout(onTransitionEnd, time);
      this.DOMNode.onTransitionEnd = onTransitionEnd;
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
