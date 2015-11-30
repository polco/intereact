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

  onNativeDragOver(e) {
    e.preventDefault();
    if (this.reactComponent.onNativeDragOver) {
      this.reactComponent.onNativeDragOver(e);
    }
  }

  onNativeDragEnter(e) {
    if (this.reactComponent.onNativeDragEnter) {
      this.reactComponent.onNativeDragEnter(e);
    }
  }

  onNativeDragLeave(e) {
    if (this.reactComponent.onNativeDragLeave) {
      this.reactComponent.onNativeDragLeave(e);
    }
  }

  onNativeDrop(e) {
    e.preventDefault();
    if (this.reactComponent.onNativeDrop) {
      this.reactComponent.onNativeDrop(e);
      e.stopPropagation();
    }
  }


  onNativeDragEnd(e) {
    e.preventDefault();
    if (this.reactComponent.onNativeDragEnd) {
      this.reactComponent.onNativeDragEnd(e);
    }
  }

  componentDidMount(DOMNode, reactComponent) {
    super.componentDidMount(DOMNode, reactComponent);

    reactComponent.onDragEnter = reactComponent.onDragEnter || onDragEnter;
    reactComponent.onDragLeave = reactComponent.onDragLeave || onDragLeave;
    this.onDropBound = this._onDrop.bind(this);
    this.DOMNode.addEventListener('intereactdrop', this.onDropBound);

    if (reactComponent.onNativeDrop || reactComponent.onNativeDragEnter || reactComponent.onNativeDragLeave) {
      this._boundNativeDragOver = this.onNativeDragOver.bind(this);
      this.DOMNode.addEventListener('dragover', this._boundNativeDragOver);

      this._boundNativeDragEnter = this.onNativeDragEnter.bind(this);
      this.DOMNode.addEventListener('dragenter', this._boundNativeDragEnter);

      this._boundNativeDragLeave = this.onNativeDragLeave.bind(this);
      this.DOMNode.addEventListener('dragleave', this._boundNativeDragLeave);

      this._boundNativeDrop = this.onNativeDrop.bind(this);
      this.DOMNode.addEventListener('drop', this._boundNativeDrop);

      this._boundNativeDragEnd = this.onNativeDragEnd.bind(this);
      this.DOMNode.addEventListener('dragend', this._boundNativeDragEnd);
    }
  }

  componentWillUnmount() {
    this.DOMNode.removeEventListener('intereactdrop', this.onDropBound);
    this.onDropBound = null;

    this.DOMNode.removeEventListener('dragover', this.onNativeDragOver);
    this.onNativeDragOver = null;
    this.DOMNode.removeEventListener('dragenter', this.onNativeDragEnter);
    this.onNativeDragEnter = null;
    this.DOMNode.removeEventListener('dragleave', this.onNativeDragLeave);
    this.onNativeDragLeave = null;
    this.DOMNode.removeEventListener('drop', this.onNativeDrop);
    this.onNativeDrop = null;
    this.DOMNode.removeEventListener('dragend', this.onNativeDragEnd);
    this.onNativeDragEnd = null;
    super.componentWillUnmount();
  }
}

export default DropPlugin;
