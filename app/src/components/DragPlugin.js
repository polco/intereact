import { tapEvents, getTap } from 'components/tapHelper';
import interactionHandler from 'components/interactionHandler';
import dragManager from 'components/dragManager';

const DRAG_THRESHOLD = 8;

function onDragStart() {}
function onDragEnd() {}

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
    this.reactComponent.onDragStart();
  }

  dragEnd() {
    this.reactComponent.onDragEnd();
  }

  _reset() {
    document.body.removeEventListener(tapEvents.move, this.tapMoveBound);
    this.tapMoveBound = null;
    document.body.removeEventListener(tapEvents.end, this.tapEndBound);
    this.tapEndBound = null;
  }

  _tapMove(e) {
    let tap = getTap(e);
    if (tap.count > 1) { return this._reset(); }

    let deltaX = this.startTap.x - tap.x;
    let deltaY = this.startTap.y - tap.y;
    if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) < DRAG_THRESHOLD) {
      return;
    }

    this._reset();
    if (interactionHandler.requestHandle(this)) {
      dragManager.startDrag(this, tap.x, tap.y, this.dragScale, this.transitionTime);
    }
  }

  _tapEnd() {
    this._reset();
  }

  _tapStart(e) {
    let tap = getTap(e);
    if (!this.enable || dragManager.isDragging || tap.count > 1) { return; }

    this.startTap = { x: tap.x, y: tap.y };
    this.tapMoveBound = this._tapMove.bind(this);
    document.body.addEventListener(tapEvents.move, this.tapMoveBound);
    this.tapEndBound = this._tapEnd.bind(this);
    document.body.addEventListener(tapEvents.end, this.tapEndBound);
  }

  componentDidMount(DOMNode, reactComponent) {
    this.reactComponent = reactComponent;
    reactComponent.onDragStart = reactComponent.onDragStart || onDragStart;
    reactComponent.onDragEnd = reactComponent.onDragEnd || onDragEnd;
    this.DOMNode = DOMNode;
    this.tapStartBound = this._tapStart.bind(this);
    this.DOMNode.addEventListener(tapEvents.start, this.tapStartBound);
  }

  componentWillUnmount() {
    this.DOMNode.removeEventListener(tapEvents.start, this.tapStartBound);
    this.tapStartBound = null;
    this.DOMNode = null;
    this._reset();
  }
}

export default DragPlugin;
