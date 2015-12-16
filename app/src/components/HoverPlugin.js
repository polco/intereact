import { EventEmitter } from 'events';
import { hovering } from 'components/hoverManager';

function onTapEnter() {}
function onTapLeave() {}
function onHoverEnd() {}

class HoverPlugin  {
  constructor() { // TODO option start hoverManager on tapStart
    this.enable = true;
  }

  tapEnter(current) { this.reactComponent.onTapEnter(current); }
  tapLeave(current) { this.reactComponent.onTapLeave(current); }
  hoverEnd() { this.reactComponent.onHoverEnd(); }

  setEnable(enable) {
    this.enable = enable;
  }

  _onHover() {
    if (!this.enable) { return; }
    hovering(this);
  }

  componentDidMount(DOMNode, reactComponent) {
    this.reactComponent = reactComponent;
    reactComponent.onTapEnter = reactComponent.onTapEnter || onTapEnter;
    reactComponent.onTapLeave = reactComponent.onTapLeave || onTapLeave;
    reactComponent.onHoverEnd = reactComponent.onHoverEnd || onHoverEnd;
    this.DOMNode = DOMNode;
    this._onHoverBound = this._onHover.bind(this);
    this.DOMNode.addEventListener('hover', this._onHoverBound);
  }

  componentWillUnmount() {
    this.DOMNode.removeEventListener('hover', this._onHoverBound);
    this._onHoverBound = null;
    this.DOMNode = null;
  }
}

export default HoverPlugin;
