import { tapEvents, getTap } from 'spur-taps';
import tapLock from 'spur-tap-lock';
import dragManager from 'components/dragManager';

const DRAG_THRESHOLD = 8;

class DragPlugin {
  constructor(options) {
    options = options || {};
    this.template = options.template || null;
    this.enable = true;
    this.dragStarted = false;
    this.dragScale = options.scale || 1.2;
    this.transitionTime = options.time || 200;

    if (options.source) {
      this.setSource(options.source);
    }
  }

  setDragScale(source) {
    this.source = source;
  }

  setDragTime(source) {
    this.source = source;
  }

  setSource(source) {
    this.source = source;
  }

  setTemplate(template) {
    this.template = template;
  }

  setEnable(enable) {
    this.enable = enable;
  }

  dragStart() {
    if (!this.reactComponent) { return; }
    if (this.reactComponent.onDragStart) { this.reactComponent.onDragStart(); }
    if (this.reactComponent.props.onDragStart) { this.reactComponent.props.onDragStart(); }
  }

  dragEnd() {
    if (!this.reactComponent) { return; }
    if (this.reactComponent.onDragEnd) { this.reactComponent.onDragEnd(); }
    if (this.reactComponent.props.onDragEnd) { this.reactComponent.props.onDragEnd(); }
  }

  reset() {
    document.body.removeEventListener(tapEvents.move, this.tapMoveBound);
    this.tapMoveBound = null;
    document.body.removeEventListener(tapEvents.end, this.tapEndBound);
    this.tapEndBound = null;
  }

  tapMove(e) {
    let tap = getTap(e);
    if (tap.count > 1) { return this.reset(); }

    let deltaX = this.startTap.x - tap.x;
    let deltaY = this.startTap.y - tap.y;
    if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) < DRAG_THRESHOLD) {
      return;
    }

    this.reset();
    if (tapLock.requestHandle(this)) {
      dragManager.startDrag(this, tap.x, tap.y, this.dragScale, this.transitionTime);
    }
  }

  tapEnd() {
    this.reset();
  }

  tapStart(e) {
    let tap = getTap(e);
    if (!this.enable || dragManager.isDragging || tap.count > 1) { return; }

    this.startTap = { x: tap.x, y: tap.y };
    this.tapMoveBound = this.tapMove.bind(this);
    document.body.addEventListener(tapEvents.move, this.tapMoveBound);
    this.tapEndBound = this.tapEnd.bind(this);
    document.body.addEventListener(tapEvents.end, this.tapEndBound);
  }

  setAttachedComponent(reactComponent, DOMNode) {
    this.reactComponent = reactComponent;
    this.DOMNode = DOMNode;
    this.tapStartBound = this.tapStart.bind(this);
    this.DOMNode.addEventListener(tapEvents.start, this.tapStartBound);
  }

  tearDown() {
    this.DOMNode.removeEventListener(tapEvents.start, this.tapStartBound);
    this.tapStartBound = null;
    this.reset();
    this.DOMNode = this.reactComponent = null;
  }
}

export default DragPlugin;
