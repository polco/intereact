import { EventEmitter } from 'events';
import { tapEvents, getTap } from 'components/tapHelper';
import { startHovering } from 'components/hoverManager';
import PluggableComponent from 'components/PluggableComponent';
import TransformPlugin from 'components/TransformPlugin';
import ReactDOM from 'react-dom';
import React from 'react';
import Promise from 'bluebird';
import './dragManager.less';

class DragContext extends PluggableComponent {
  constructor(props) {
    super(props);
    this.transform = this.addPlugin(new TransformPlugin());
    this.state = { template: null };
  }

  setTemplate(template) {
    this.setState({ template });
  }

  render() {
    return (
      <div className='drag-wrapper'>
        {this.state.template}
      </div>
    );
  }
}

class DragManager extends EventEmitter {
  constructor() {
    super();
    let dragContainer = document.createElement('div');
    dragContainer.classList.add('drag-container');
    document.body.appendChild(dragContainer);
    this.dragContainerNode = dragContainer;

    document.addEventListener('intereactdrop', () => {
      console.log('drop not caught!')
      let pos = this.initialPosition;
      this.dragContext.transform.setPositionOffset(0, 0);
      this.dragContext.transform.transformTo({ x: pos.x, y: pos.y, scale: 1 }).then(() => {
        this.dragPlugin.dragEnd();
        this.emit('dragEnd');
        this.dragContext.transform.hide();
      });
    }, false);

    this.dragContext = ReactDOM.render(React.createElement(DragContext), this.dragContainerNode);
  }

  _reset() {
    document.body.removeEventListener(tapEvents.move, this.tapMoveBound);
    this.tapMoveBound = null;
    document.body.removeEventListener(tapEvents.end, this.tapEndBound);
    this.tapEndBound = null;
  }

  _tapMove(e) {
    let tap = getTap(e);
    if (this.dragContext.transform.isTransitioning) {
      this.dragContext.transform.transformTo({ x: tap.x, y: tap.y, scale: this.dragPlugin.dragScale, time: 50 });
    } else {
      this.dragContext.transform.setPosition(tap.x, tap.y);
    }
  }

  _tapEnd() {
    this._reset();
    this.isDragging = false;
    let dropTarget = document.elementFromPoint(this.dragContext.transform.x, this.dragContext.transform.y);
    let dropEvent = document.createEvent('Event');
    dropEvent.initEvent('intereactdrop', true, true);
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

    let transform = dragPlugin.reactComponent.transform || {
      rotation: 0,
      width: elementBox.width,
      height: elementBox.height,
    };
    this.dragContext.transform.setPosition(elementBox.left, elementBox.top);
    this.dragContext.transform.setRotation(transform.rotation);
    this.dragContext.transform.setDimensions(transform.width, transform.height);
    this.dragContext.transform.setPositionOffset(elementBox.left - x, elementBox.top - y);
    this.dragContext.setTemplate(dragPlugin.template);

    this.dragContext.transform.show().then(() => {
      return this.dragContext.transform.transformTo({ x: x, y: y, scale: scale, time: time });
    });
    dragPlugin.dragStart();
  }

  setDropTarget(dropPlugin) {
    let transform = this.dragContext.transform;
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

    this.dragContext.transform.transformTo(dropTransform).then(() => {
      this.dragContext.transform.hide();
      this.dragPlugin.dragEnd();
      this.emit('dragEnd');
      dropPlugin.didDrop(this.dragPlugin, x, y);
    });
  }
}

let dragManager = new DragManager();
export default dragManager;
