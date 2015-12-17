import { tapEvents, getTap } from 'spur-taps';
import interactionHandler from 'spur-tap-lock';
import { EventEmitter, listenerCount } from 'events';

let current;

const LONG_TAP_TIMEOUT = 400;

function onTapStart() {}
function onTapEnd() {}
function onTap() {}
class TapPlugin extends EventEmitter {
  constructor() {
    super();
    this.enable = true;
  }

  tapStart(coords) { this.reactComponent.onTapStart(); this.emit('tapStart', coords); }
  tapEnd() { this.reactComponent.onTapEnd(); this.emit('tapEnd'); }
  tap() { this.reactComponent.onTap(); if (this.reactComponent.props.onTap) { this.reactComponent.props.onTap(); } }
  longTap(coords) { if (this.reactComponent.onLongTap) {
      this.reactComponent.onLongTap();
    }
    this.emit('longTap', coords);
  }

  setEnable(enable) {
    this.enable = enable;
  }

  _reset() {
    current = null;
    window.clearTimeout(this.longTapTimeout);
    document.body.removeEventListener(tapEvents.move, this.tapMoveBound);
    this.tapMoveBound = null;
    document.body.removeEventListener(tapEvents.end, this.tapEndBound);
    this.tapEndBound = null;
  }

  cancelTap() {
    if (current === this) {
      this.cancelled = true;
      this.tapEnd();
    }

    this._reset();
  }

  _tapMove(e) {
    let tap = getTap(e);
    if (tap.x < this.boundingBox.left ||
      tap.x > this.boundingBox.left + this.boundingBox.width ||
      tap.y < this.boundingBox.top ||
      tap.y > this.boundingBox.top + this.boundingBox.height) {
      this.cancelTap();
    }
  }

  _tapStart(e) {
    let tap = getTap(e);
    if (current || !this.enable || tap.count > 1) { return; }
    current = this;
    this.cancelled = false;
    let startTap = {
      x: tap.x,
      y: tap.y
    }

    this.boundingBox = this.DOMNode.getBoundingClientRect();
    this.tapStart(startTap);

    if (this.listenerCount('longTap') > 0 || this.reactComponent.onLongTap) {
      window.clearTimeout(this.longTapTimeout);
      this.longTapTimeout = window.setTimeout(() => {
        this.tapEnd();
        this._reset();
        if (interactionHandler.requestHandle(this)){
          this.longTap(startTap);
        }
      }, LONG_TAP_TIMEOUT);
    }

    this.tapMoveBound = this._tapMove.bind(this);
    document.body.addEventListener(tapEvents.move, this.tapMoveBound);
    this.tapEndBound = this._tapEnd.bind(this);
    document.body.addEventListener(tapEvents.end, this.tapEndBound);
  }

  _tapEnd() {
    if (this.cancelled) {
      return;
    }

    this._reset();
    this.tapEnd();
    this.tap();
  }

  componentDidMount(DOMNode, reactComponent) {
    this.reactComponent = reactComponent;
    reactComponent.onTapStart = reactComponent.onTapStart || onTapStart;
    reactComponent.onTapEnd = reactComponent.onTapEnd || onTapEnd;
    reactComponent.onTap = reactComponent.onTap || onTap;
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

interactionHandler.on('handleTaken', function () {
  if (current) {
    current.cancelTap();
    current = null;
  }
});

export default TapPlugin;
