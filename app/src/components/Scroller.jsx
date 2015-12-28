import React from 'react';
import ReactDOM from 'react-dom';
import { tapEvents, getTap } from 'spur-taps';
import interactionHandler from 'spur-tap-lock';
import TINA from 'tina';
import 'styles/Scroller.less';

const SCROLL_THRESHOLD = 8;
let tweener = new TINA.Timer(1000);
tweener.silent(true);
tweener.start();

class Scroller extends React.Component {
  constructor(props) {
    super(props);
    this.isScrolling = false;
    this.y = 0;
    this.speed = 1;
    this.deceleration = 0.004;
    this.tween =  (new TINA.Tween(this, ['y'])).tweener(tweener);

    this.props = {
      fingerCount: 1
    };
  }

  _reset() {
    document.body.removeEventListener(tapEvents.move, this._tapMoveBound);
    this._tapMoveBound = null;
    document.body.removeEventListener(tapEvents.end, this._tapEndBound);
    this._tapEndBound = null;
    this.isInitialised = false;
  }

  _tapMove(e) {
    let tap = getTap(e);
    if (tap.count != this.props.fingerCount) { return console.log('move not enough fingers'); }
    let deltaY = this.startTapY - tap.y;

    if (!this.isScrolling) {
      if (Math.abs(deltaY) < SCROLL_THRESHOLD) {
        return;
      }

      if (!interactionHandler.requestHandle(this)) {
        return this._reset();
      }

      this.isScrolling = true;
    }

    let currentY = this.y;
    let currentTime = Date.now();
    this.lastMoveTimeDelta = currentTime - this.lastMoveTime;
    this.lastMoveTime = currentTime;
    this.y = this.startPositionY + deltaY;
    this.lastMoveYDelta = currentY - this.lastMoveY;
    this.lastMoveY = currentY;
    if (this.y < 0) {
      this.y = 0;
    } else if (this.y > this.maxScrollY) {
      this.y = this.maxScrollY;
    }
    this.contentStyle.transform = 'translate3d(0,' + -this.y + 'px,0)';
  }

  _tapEnd(e) {
    this._reset();

    if (!this.isScrolling) { return console.log('scroll never started'); }
    this.isScrolling = false;

    // if (this.lastMoveTimeDelta > 300) { return; }

    let speed = Math.abs(this.lastMoveYDelta) / (this.lastMoveTimeDelta || 1);
    if (speed < 0.5) { return console.log('too low speed', speed); }

    let distance = Math.floor(speed * speed / (2 * this.deceleration));
    if (distance === 0) { return console.log('null distance'); }

    let newY;
    if (this.lastMoveYDelta > 0) {
      newY = this.y + distance
      if (newY > this.maxScrollY) {
        newY = this.maxScrollY;
      }
    } else {
      newY = this.y - distance;
      if (newY < 0) {
        newY = 0;
      }
    }

    let duration = Math.floor(speed / this.deceleration);
    this.scrollTo(newY, duration);
  }

  _tapStart(e) {
    let tap = getTap(e);
    this.tween.stop();
    if (this.isInitialised || this.isScrolling || tap.count != this.props.fingerCount) { return; }
    this.isInitialised = true;

    this.startTapY = tap.y;
    this.startPositionY = this.y;
    this.lastMoveY = this.startPositionY;
    this.startTime = Date.now();
    this.lastMoveTime = this.startTime;
    this.lastMoveYDelta = 0;

    this._tapMoveBound = this._tapMove.bind(this);
    document.body.addEventListener(tapEvents.move, this._tapMoveBound);
    this._tapEndBound = this._tapEnd.bind(this);
    document.body.addEventListener(tapEvents.end, this._tapEndBound);
  }

  refresh() {
    this.contentHeight = this.scrollContent.clientHeight;
    this.containerHeight = this.scroller.clientHeight;
    this.maxScrollY = Math.max(0, this.contentHeight - this.containerHeight);

    if (this.y > this.maxScrollY) {
      this.scrollTo(this.y);
    }
  }

  scrollTo(y, duration) {
    if (y < 0) {
      y = 0;
    } else if (y > this.maxScrollY) {
      y = this.maxScrollY;
    }
    let distance = Math.abs(this.y - y);
    if (distance === 0) { return; }

    if (!duration) {
      duration = Math.floor(distance / this.speed);
    }

    this.tween.stop();
    this.tween = new TINA.Tween(this, ['y'])
      .tweener(tweener)
      .to({ y: y }, duration, TINA.easing.quadOut)
      .onUpdate(() => {
        this.contentStyle.transform = 'translate3d(0,' + -this.y + 'px,0)';
      })
      .start();
  }

  _onWheel(e) {
    this.scrollTo(this.y + e.deltaY);
  }

  componentDidUpdate() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.contentHeight) {
      this.scrollContent.style.height = nextProps.contentHeight + 'px';
    }
  }

  componentDidMount() {
    this.contentStyle = this.scrollContent.style;
    this._tapStartBound = this._tapStart.bind(this);
    this.scroller.addEventListener(tapEvents.start, this._tapStartBound);
    this._onWheelBound = this._onWheel.bind(this);
    this.scroller.addEventListener('wheel', this._onWheelBound);
    this.refresh();
  }

  componentWillUnMount() {
    this.scroller.removeEventListener(tapEvents.start, this._tapStartBound);
    this._tapStartBound = null;
    this.scroller.removeEventListener('wheel', this._onWheelBound);
    this._onWheelBound = null;
  }

  render() {
    return (
      <div className='scroller' ref={(ref) => { this.scroller = ref; }}>
        <div className='scrollContent' ref={(ref) => { this.scrollContent = ref; }}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Scroller;
