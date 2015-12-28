import React from 'react';
import ReactDom from 'react-dom';
import plug from 'plugins/plug';
import DragPlugin from 'plugins/DragPlugin';
import TransformPlugin from 'plugins/TransformPlugin';
import { tapEvents, getTap, getMouseTap } from 'spur-taps';
import tapLock from 'spur-tap-lock';
import ButtonPlugin from 'spur-button-plugin';
import 'styles/MoodboardItem.less';

const PINCH_TRESHOLD = 8 * 8;

export class MoodboardItem extends React.Component {
  constructor(props) {
    super(props);

    this.dragPlugin = this.addPlugin(new DragPlugin({ scale: 1, time: 1 }));
    this.addPlugin(new TapPlugin());
    this.dragPlugin.setSource('moodboard');
  }

  updateDisplay(props) {
    this.props.transform.setPosition(props.item.x, props.item.y);
    this.props.transform.setDimensions(props.item.width, props.item.height);
    this.props.transform.setOpacity(props.opacity != undefined ? props.opacity : 1);
  }

  componentWillReceiveProps(nextProps) {
    this.updateDisplay(nextProps)
  }

  scaleToDimension() {
    let scale = this.props.transform.scale;
    let newWidth = this.props.transform.width * scale;
    let newHeight = this.props.transform.height * scale;
    let x = this.props.transform.x + (this.props.transform.width - newWidth) / 2;
    let y = this.props.transform.y + (this.props.transform.height - newHeight) / 2;
    this.props.updateItemDimensions(this.props.moodboardId, this.props.id, newWidth, newHeight, x, y);
    this.props.transform.setScale(1);
  }

  onWheel(e) {
    let w=e.wheelDelta, d=e.detail;
    let distance = 1;
    if (d){
      if (w) distance = w / d / 40 * d > 0 ? 1 : -1; // Opera
      else distance = -d / 3;              // Firefox;         TODO: do not /3 for OS X
    } else distance = w / 120;

    let scale = Math.max(0.5, this.props.transform.scale + distance / 20);
    this.props.transform.setScale(scale);
    e.preventDefault();
    e.stopPropagation();

    window.clearTimeout(this.wheelTimeout);
    this.wheelTimeout = window.setTimeout(() => {
      this.scaleToDimension();
    }, 250);
  }

  reset() {
    document.body.removeEventListener(tapEvents.move, this.boundTapMove);
    this.boundTapMove = null;
    document.body.removeEventListener(tapEvents.end, this.boundTapEnd);
    this.boundTapEnd = null;
    // document.body.removeEventListener(tapEvents.start, this.boundWindowTapStart);
    // this.boundWindowTapStart = null;
    this.isInitialised = false;
  }

  onDragStart() {
    this.props.transform.setOpacity(0);
  }

  // onDragEnd() {
  //   this.transform.setOpacity(1);
  // }

  initRotation(tap1, tap2) {
    let deltaX = tap1.x - tap2.x;
    let deltaY = tap1.y - tap2.y;
    this.initialDistance = deltaX * deltaX + deltaY * deltaY;
    this.initialAngle = this.props.transform.rotation;
    this.initialTapAngle = Math.atan2(deltaX, deltaY);
    this.initialCenter = { x: tap1.x + deltaX / 2, y: tap1.y + deltaY / 2 };
  }

  onWindowTapStart(e) {
    let tap = getTap(e);
    if (tap.count != 2) { return; }
    this.initRotation(tap.taps[0], tap.taps[1]);
  }

  onDOMTapStart() {
    if (this.isInitialised) { return; }
    this.isInitialised = true;
    this.isPinching = false;

    this.boundWindowTapStart = this.onWindowTapStart.bind(this);
    document.body.addEventListener(tapEvents.start, this.boundWindowTapStart);

    this.boundTapMove = this.onDOMTapMove.bind(this);
    document.body.addEventListener(tapEvents.move, this.boundTapMove);

    this.boundTapEnd = this.onDOMTapEnd.bind(this);
    document.body.addEventListener(tapEvents.end, this.boundTapEnd);
  }

  transformImage(tap1, tap2) {
    let deltaX = tap1.x - tap2.x;
    let deltaY = tap1.y - tap2.y;
    let distance = deltaX * deltaX + deltaY * deltaY;
    let angleChange = this.initialTapAngle - Math.atan2(deltaX, deltaY);
    this.props.transform.transform(this.props.transform.x, this.props.transform.y, distance / this.initialDistance, this.initialAngle + angleChange);
  }

  onDOMTapMove(e) {
    let tap = getTap(e);
    if (tap.count !== 2) { return; }
    let tap1 = tap.taps[0];
    let tap2 = tap.taps[1];

    if (!this.isPinching) {
      let deltaX = tap1.x - tap2.x;
      let deltaY = tap1.y - tap2.y;
      let distance = deltaX * deltaX + deltaY * deltaY;

      if (distance < PINCH_TRESHOLD || !tapLock.requestHandle(this)) { return; }
      this.isPinching = true;
    }

    this.transformImage(tap1, tap2);
  }

  onDOMTapEnd(e) {
    let tap = getTap(e);

    if (this.isPinching) {
      this.scaleToDimension();
    }

    if (tap.count === 0) {
      this.isPinching = false;
      this.reset();
    }
  }

  resetMouse() {
    document.body.removeEventListener('mousemove', this.boundMouseTapMove);
    this.boundMouseTapMove = null;

    document.body.removeEventListener('mouseup', this.boundMouseTapEnd);
    this.boundMouseTapEnd = null;
  }

  onMouseTapMove(e) {
    let tap = getMouseTap(e);
    this.transformImage(this.itemCenter, tap);
  }

  onMouseTapEnd() {
    this.scaleToDimension();
    this.resetMouse();
  }

  tapOnRotateIcon(e) {
    if (!tapLock.requestHandle(this)) { return; }
    let tap = getMouseTap(e);

    let boundingBox = this.DOMNode.getBoundingClientRect();
    this.itemCenter = { x: boundingBox.left + boundingBox.width / 2, y: boundingBox.top + boundingBox.height / 2 };
    this.initRotation(this.itemCenter, tap);

    this.boundMouseTapMove = this.onMouseTapMove.bind(this);
    document.body.addEventListener('mousemove', this.boundMouseTapMove);

    this.boundMouseTapEnd = this.onMouseTapEnd.bind(this);
    document.body.addEventListener('mouseup', this.boundMouseTapEnd);
  }


  componentDidMount() {
    this.DOMNode = ReactDom.findDOMNode(this);
    this.props.drag.setDragScale(1);
    this.props.drag.setDragTime(1);
    this.updateDisplay(this.props);

    this._boundWheel = this.onWheel.bind(this);
    this.DOMNode.addEventListener('wheel', this._boundWheel);

    this.boundTapStart = this.onDOMTapStart.bind(this);
    this.DOMNode.addEventListener(tapEvents.start, this.boundTapStart);

    this.boundRotateTapStart = this.tapOnRotateIcon.bind(this);
    this.rotateIcon.addEventListener('mousedown', this.boundRotateTapStart);
  }

  componentWillUnmount() {
    this.DOMNode.removeEventListener('wheel', this._boundWheel);
    this._boundWheel = null;
    this.DOMNode.removeEventListener(tapEvents.start, this.boundTapStart);
    this.boundTapStart = null;
    this.DOMNode.removeEventListener('mousedown', this.boundRotateTapStart);
    this.boundRotateTapStart = null;
    this.DOMNode = null;
  }

  onTap() {
    this.props.putInFront(this.props.moodboardId, this.props.id);
  }

  render() {
    let content;
    let item = this.props.item;
    if (item.type === 'image') {
      this.content = item.content;
      let style = {
        height: '100%',
        backgroundSize: '100% 100%',
        backgroundImage: 'url(' + item.content.backgroundImage + ')'
      }
      content = (<div className='image' style={style}></div>);
    } else {
      content = '<div>unknown content</div>';
    }
    let renderedElement = (
      <div className='moodboard-item'>{content}<div className='rotate-icon' ref={(ref)=>{this.rotateIcon = ref;}}></div></div>
    );
    this.dragPlugin.setTemplate(renderedElement);
    return renderedElement;
  }
}

export default plug({ button: ButtonPlugin, transform: TransformPlugin, drag: DragPlugin }, MoodboardItem);
