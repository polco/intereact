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
  }

  render() {
    return (<div>{this.props.current}</div>);
  }
}

class DragManager extends EventEmitter {
  constructor() {
    super();
    let dragContainer = document.createElement('div');
    dragContainer.classList.add('drag-container');
    document.body.appendChild(dragContainer);
    this.dragContainerNode = dragContainer;

    document.addEventListener('drop', () => {
      console.log('drop not caught!')
      let pos = this.initialPosition;
      this.dragContext.transform.setPositionOffset(0, 0);
      this.dragContext.transform.transformTo({ x: pos.x, y: pos.y, scale: 1 }).then(() => {
        this.dragPlugin.dragEnd();
        this.dragContext.transform.hide();
      });
    }, false);
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
      this.dragContext.transform.transformTo({ x: tap.x, y: tap.y, scale: 1.2, time: 50 });
    } else {
      this.dragContext.transform.setPosition(tap.x, tap.y);
    }
  }

  _tapEnd() {
    this._reset();
    this.isDragging = false;
    let dropTarget = document.elementFromPoint(this.dragContext.transform.x, this.dragContext.transform.y);
    let dropEvent = document.createEvent('Event');
    dropEvent.initEvent('drop', true, true);
    dropTarget.dispatchEvent(dropEvent);
  }

  startDrag(dragPlugin, x, y) {
    startHovering();
    this.tapMoveBound = this._tapMove.bind(this);
    document.body.addEventListener(tapEvents.move, this.tapMoveBound);
    this.tapEndBound = this._tapEnd.bind(this);
    document.body.addEventListener(tapEvents.end, this.tapEndBound);

    this.dragPlugin = dragPlugin;
    this.isDragging = true;

    let elementBox = dragPlugin.DOMNode.getBoundingClientRect();
    this.initialPosition = { x: elementBox.left, y: elementBox.top };

    this.dragContext = ReactDOM.render(React.createElement(DragContext, { current: dragPlugin.template }), this.dragContainerNode);
    this.dragContext.transform.setPosition(elementBox.left, elementBox.top);
    this.dragContext.transform.setDimensions(elementBox.width, elementBox.height);
    this.dragContext.transform.setPositionOffset(-elementBox.width/2, -elementBox.height/2);
    this.dragContext.transform.show().then(() => {
      return this.dragContext.transform.transformTo({ x: x, y: y, scale: 1.2 });
    });
    dragPlugin.dragStart();
  }

  setDropTarget(dropPlugin) {
    let dropTransform = dropPlugin.willDrop(this.dragPlugin, this.dragContext.x, this.dragContext.y);
    if (!dropTransform) {
      let x, y;
      if (dropPlugin.matchTarget) {
        let elementBox = dropPlugin.DOMNode.getBoundingClientRect();
        this.dragContext.transform.setDimensions(elementBox.width, elementBox.height);
        this.dragContext.transform.setPositionOffset(0, 0);
        dropTransform = { x: elementBox.left, y: elementBox.top, scale: 1 };
      } else {
        dropTransform = { scale: 1  }
      }
    } else {
      this.dragContext.transform.setPositionOffset(0, 0);
    }

    this.dragContext.transform.transformTo(dropTransform).then(() => {
      this.dragContext.transform.hide();
      this.dragContext.transform.setPositionOffset(0, 0);
      this.dragPlugin.dragEnd();
      dropPlugin.didDrop('drop', this.dragPlugin, this.dragContext.transform.x, this.dragContext.transform.y);
    });
  }
}

let dragManager = new DragManager();
export default dragManager;
