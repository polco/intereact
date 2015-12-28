import { EventEmitter } from 'events';
import { tapEvents, getTap } from 'spur-taps';
import { startHovering } from 'components/hoverManager';
import plug from 'plugins/plug';
import TransformPlugin from 'plugins/TransformPlugin';
import ReactDOM from 'react-dom';
import React from 'react';
import Promise from 'bluebird';
import 'styles/dragManager.less';

class DragContext extends React.Component {
  constructor(props) {
    super(props);
    this.state = { template: null };
  }

  render() {
    return (
      <div className='drag-wrapper'>
        {this.props.template}
      </div>
    );
  }
}

let DragElement = plug({ transform: TransformPlugin }, DragContext);

class DragManager extends EventEmitter {
  constructor() {
    super();
    let dragContainer = document.createElement('div');
    dragContainer.classList.add('drag-container');
    document.body.appendChild(dragContainer);
    this.dragContainerNode = dragContainer;

    document.addEventListener('spurdrop', () => {
      console.log('drop not caught!')
      let pos = this.initialPosition;
      this.dragTransform.setPositionOffset(0, 0);
      this.dragTransform.transformTo({ x: pos.x, y: pos.y, scale: 1 }).then(() => {
        this.dragPlugin.dragEnd();
        this.emit('dragEnd');
        this.dragTransform.hide();
      });
    }, false);

    this.dragContext = ReactDOM.render(React.createElement(DragElement), this.dragContainerNode);
    this.dragTransform = this.dragContext.plugins.transform;
  }

  _reset() {
    document.body.removeEventListener(tapEvents.move, this.tapMoveBound);
    this.tapMoveBound = null;
    document.body.removeEventListener(tapEvents.end, this.tapEndBound);
    this.tapEndBound = null;
  }

  _tapMove(e) {
    let tap = getTap(e);
    if (this.dragTransform.isTransitioning) {
      this.dragTransform.transformTo({ x: tap.x, y: tap.y, scale: this.dragPlugin.dragScale, time: 50 });
    } else {
      this.dragTransform.setPosition(tap.x, tap.y);
    }
  }

  _tapEnd() {
    this._reset();
    this.isDragging = false;
    let dropTarget = document.elementFromPoint(this.dragTransform.x, this.dragTransform.y);
    let dropEvent = document.createEvent('Event');
    dropEvent.initEvent('spurdrop', true, true);
    dropTarget.dispatchEvent(dropEvent);
  }

  startDrag(dragPlugin, x, y, scale, time) {
    startHovering();
    this.tapMoveBound = this._tapMove.bind(this);
    document.body.addEventListener(tapEvents.move, this.tapMoveBound);
    this.tapEndBound = this._tapEnd.bind(this);
    document.body.addEventListener(tapEvents.end, this.tapEndBound);

    this.dragPlugin = dragPlugin;
    this.isDragging = true;

    let elementBox = dragPlugin.DOMNode.getBoundingClientRect();
    this.initialPosition = { x: elementBox.left, y: elementBox.top };

    let transform = dragPlugin.reactComponent.props.transform || {
      rotation: 0,
      width: elementBox.width,
      height: elementBox.height,
    };
    this.dragTransform.setPosition(elementBox.left, elementBox.top);
    this.dragTransform.setRotation(transform.rotation);
    this.dragTransform.setDimensions(transform.width, transform.height);
    this.dragTransform.setPositionOffset(elementBox.left - x, elementBox.top - y);
    this.dragContext.setState({ template: dragPlugin.template });

    this.dragTransform.show().then(() => {
      return this.dragTransform.transformTo({ x: x, y: y, scale: scale, time: time });
    });
    dragPlugin.dragStart();
  }

  setDropTarget(dropPlugin) {
    let transform = this.dragTransform;
    let x = transform.x + transform.offsetX;
    let y = transform.y + transform.offsetY;
    let dropTransform = dropPlugin.willDrop(this.dragPlugin, x, y);

    if (!dropTransform) {
      if (dropPlugin.matchTarget) {
        let elementBox = dropPlugin.DOMNode.getBoundingClientRect();
        transform.setDimensions(elementBox.width, elementBox.height);
        dropTransform = { x: elementBox.left, y: elementBox.top, scale: 1 };
      } else {
        dropTransform = { x: x, y: y,  scale: 1, time: this.dragPlugin.transitionTime }
      }
    }

    transform.setPositionOffset(0, 0);

    this.dragTransform.transformTo(dropTransform).then(() => {
      this.dragTransform.hide();
      this.dragPlugin.dragEnd();
      this.emit('dragEnd');
      dropPlugin.didDrop(this.dragPlugin, x, y);
    });
  }
}

let dragManager = new DragManager();
export default dragManager;
