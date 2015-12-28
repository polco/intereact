import HoverPlugin from 'plugins/HoverPlugin';
import dragManager from 'components/dragManager';

const DRAG_THRESHOLD = 8;

class DropPlugin extends HoverPlugin  {
  constructor(options) {
    super();
    options = options || {};
    this.matchTarget = options.matchTarget || false;
    this.enable = true;
  }

  tapEnter() {
    if (!dragManager.isDragging) { return; }
    if (this.reactComponent.onDragEnter) { this.reactComponent.onDragEnter(dragManager.dragPlugin); }
    if (this.reactComponent.props.onDragEnter) { this.reactComponent.props.onDragEnter(dragManager.dragPlugin); }
  }
  tapLeave() {
    if (!dragManager.isDragging) { return; }
    if (this.reactComponent.onDragLeave) { this.reactComponent.onDragLeave(dragManager.dragPlugin); }
    if (this.reactComponent.props.onDragLeave) { this.reactComponent.props.onDragLeave(dragManager.dragPlugin); }
  }

  setEnable(enable) {
    this.enable = enable;
  }

  willDrop(dragPlugin, x, y) {
    if (this.reactComponent.willDrop) { return this.reactComponent.willDrop(dragPlugin, x, y); }
    if (this.reactComponent.props.willDrop) { return this.reactComponent.props.willDrop(dragPlugin, x, y); }
  }

  didDrop(dragPlugin, x, y) {
    if (this.reactComponent.didDrop) { this.reactComponent.didDrop(dragPlugin, x, y); }
    if (this.reactComponent.props.didDrop) { this.reactComponent.props.didDrop(dragPlugin, x, y); }
  }

  onDrop(e) {
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

  setAttachedComponent(reactComponent, DOMNode) {
    super.componentDidMount(DOMNode, reactComponent);

    this.onDropBound = this.onDrop.bind(this);
    this.DOMNode.addEventListener('spurdrop', this.onDropBound);

    if (reactComponent.onNativeDrop || reactComponent.onNativeDragEnter || reactComponent.onNativeDragLeave) {
      this.boundNativeDragOver = this.onNativeDragOver.bind(this);
      this.DOMNode.addEventListener('dragover', this.boundNativeDragOver);

      this.boundNativeDragEnter = this.onNativeDragEnter.bind(this);
      this.DOMNode.addEventListener('dragenter', this.boundNativeDragEnter);

      this.boundNativeDragLeave = this.onNativeDragLeave.bind(this);
      this.DOMNode.addEventListener('dragleave', this.boundNativeDragLeave);

      this.boundNativeDrop = this.onNativeDrop.bind(this);
      this.DOMNode.addEventListener('drop', this.boundNativeDrop);

      this.boundNativeDragEnd = this.onNativeDragEnd.bind(this);
      this.DOMNode.addEventListener('dragend', this.boundNativeDragEnd);
    }
  }

  tearDown() {
    this.DOMNode.removeEventListener('spurdrop', this.onDropBound);
    this.onDropBound = null;

    this.DOMNode.removeEventListener('dragover', this.boundNativeDragOver);
    this.boundNativeDragOver = null;
    this.DOMNode.removeEventListener('dragenter', this.boundNativeDragEnter);
    this.boundNativeDragEnter = null;
    this.DOMNode.removeEventListener('dragleave', this.boundNativeDragLeave);
    this.boundNativeDragLeave = null;
    this.DOMNode.removeEventListener('drop', this.boundNativeDrop);
    this.boundNativeDrop = null;
    this.DOMNode.removeEventListener('dragend', this.boundNativeDragEnd);
    this.boundNativeDragEnd = null;

    super.componentWillUnmount();

    this.DOMNode = this.reactComponent = null;
  }
}

export default DropPlugin;
