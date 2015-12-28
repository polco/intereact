import { tapEvents, getTap } from 'spur-taps';
import tapLock from 'spur-tap-lock';

let current;

tapLock.on('handleTaken', function () {
  if (current) {
    current.cancel();
    current = null;
  }
});


const LONG_TAP_TIMEOUT = 400;


class ButtonPlugin {
  constructor(enable=true) {
    this.enable = enable;
  }

  tapStart(coords) {
    if (this.reactComponent.onPress) { this.reactComponent.onPress(coords); }
    if (this.reactComponent.props.onPress) { this.reactComponent.props.onPress(coords); }
  }

  tapEnd(cancelled) {
    if (this.reactComponent.onRelease) { this.reactComponent.onRelease(cancelled); }
    if (this.reactComponent.props.onRelease) { this.reactComponent.props.onRelease(cancelled); }
  }

  tap() {
    if (this.reactComponent.onTap) { this.reactComponent.onTap(); }
    if (this.reactComponent.props.onTap) { this.reactComponent.props.onTap(); }
  }

  longTap(coords) {
    if (this.reactComponent.onLongTap) { this.reactComponent.onLongTap(); }
    if (this.reactComponent.props.onLongTap) { this.reactComponent.props.onLongTap(); }
  }

  setEnable(enable) {
    this.enable = enable;
  }

  reset() {
    current = null;
    window.clearTimeout(this.longTapTimeout);
    window.removeEventListener(tapEvents.move, this.tapMoveBound);
    this.tapMoveBound = null;
    window.removeEventListener(tapEvents.end, this.tapEndBound);
    this.tapEndBound = null;
  }

  cancel() {
    if (current === this) {
      this.cancelled = true;
      this.tapEnd(true);
    }

    this.reset();
  }

  onDOMTapMove(e) {
    let tap = getTap(e);
    if (tap.x < this.boundingBox.left ||
      tap.x > this.boundingBox.left + this.boundingBox.width ||
      tap.y < this.boundingBox.top ||
      tap.y > this.boundingBox.top + this.boundingBox.height) {
      this.cancel();
    }
  }

  onDOMTapStart(e) {
    let tap = getTap(e);
    if (current || !this.enable || tap.count > 1 || e.which === 3) { return; }
    current = this;
    this.cancelled = false;
    let startTap = {
      x: tap.x,
      y: tap.y
    }

    this.boundingBox = this.DOMNode.getBoundingClientRect();
    this.tapStart(startTap);

    if (this.reactComponent.onLongTap || this.reactComponent.props.onLongTap) {
      window.clearTimeout(this.longTapTimeout);
      this.longTapTimeout = window.setTimeout(() => {
        this.tapEnd();
        this.reset();
        if (tapLock.requestHandle(this)){
          this.longTap(startTap);
        }
      }, LONG_TAP_TIMEOUT);
    }

    this.tapMoveBound = this.onDOMTapMove.bind(this);
    window.addEventListener(tapEvents.move, this.tapMoveBound);
    this.tapEndBound = this.onDOMTapEnd.bind(this);
    window.addEventListener(tapEvents.end, this.tapEndBound);
  }

  onDOMTapEnd() {
    if (this.cancelled) {
      return;
    }

    this.reset();
    this.tapEnd();
    this.tap();
  }

  tearDown() {
    this.DOMNode.removeEventListener(tapEvents.start, this.tapStartBound);
    this.tapStartBound = null;
    this.DOMNode = null;
    this.reset();
  }

  setAttachedComponent(reactComponent, DOMNode) {
    this.reactComponent = reactComponent;
    this.DOMNode = DOMNode;
    this.tapStartBound = this.onDOMTapStart.bind(this);
    this.DOMNode.addEventListener(tapEvents.start, this.tapStartBound);
  }
}

export default ButtonPlugin;
