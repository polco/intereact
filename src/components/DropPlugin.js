import HoverPlugin from 'components/HoverPlugin';
import dragManager from 'components/dragManager';

const DRAG_THRESHOLD = 8;

function onDrop() {}
function onDragEnter() {}
function onDragLeave() {}

class DropPlugin extends HoverPlugin  {
  constructor(options) {
    super();
    options = options || {};
    this.matchTarget = options.matchTarget || false;
    this.enable = true;
  }

  tapEnter() {
    if (!dragManager.isDragging) { return; }
    this.reactComponent.onDragEnter(dragManager.dragPlugin);
  }
  tapLeave() {
    if (!dragManager.isDragging) { return; }
    this.reactComponent.onDragLeave(dragManager.dragPlugin);
  }

  setEnable(enable) {
    this.enable = enable;
  }

  willDrop(dragPlugin, x, y) {
    if (this.reactComponent.willDrop) {
      return this.reactComponent.willDrop(dragPlugin, x, y);
    }
  }

  didDrop(dragPlugin, x, y) {
    if (this.reactComponent.didDrop) {
      this.reactComponent.didDrop(dragPlugin, x, y);
    }
  }

  _onDrop(e) {
    if (!this.enable) { return; }
    e.stopPropagation();
    dragManager.setDropTarget(this);
  }

  componentDidMount(DOMNode, reactComponent) {
    super.componentDidMount(DOMNode, reactComponent);

    reactComponent.onDragEnter = reactComponent.onDragEnter || onDragEnter;
    reactComponent.onDragLeave = reactComponent.onDragLeave || onDragLeave;
    this.onDropBound = this._onDrop.bind(this);
    this.DOMNode.addEventListener('intereactdrop', this.onDropBound);
  }

  componentWillUnmount() {
    this.DOMNode.removeEventListener('intereactdrop', this.onDropBound);
    this.onDropBound = null;
    super.componentWillUnmount();
  }
}

export default DropPlugin;
