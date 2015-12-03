import TapPlugin from 'components/TapPlugin';
import DragPlugin from 'components/DragPlugin';
import PluggableComponent from 'components/PluggableComponent';
import TransformPlugin from 'components/TransformPlugin';

class GridElement extends PluggableComponent {
  constructor(props) {
    super(props);

    this.addPlugin(new TapPlugin());
    this.dragPlugin = this.addPlugin(new DragPlugin(this.props.children, 'scrapbook'));
    this.transform = this.addPlugin(new TransformPlugin());

    this.opened = false;
  }

  onLongTap() {
    if (!this.opened) {
      this.open();
    }
  }
  onTap() {
    if (this.opened) {
      this.close();
    } else {
      this.DOMNode.classList.toggle('selected');
    }
  }

  open() {
    if (this.opened) { return; }
    this.transform.style.zIndex = 1;
    this.transform.scaleTo(1.5, 100);
    this.opened = true;
  }

  close() {
    if (!this.opened) { return; }
    this.transform.scaleTo(1, 100).then(() => {
      this.transform.style.zIndex = 0;
    });
    this.opened = false;
  }

  onDragStart() {
    this.close();
  }

  onTapStart() {
    this.DOMNode.classList.add('pressed');
  }

  onTapEnd() {
    this.DOMNode.classList.remove('pressed');
  }

  onDragEnter() {
    this.DOMNode.classList.add('hover');
  }

  onDragLeave() {
    this.DOMNode.classList.remove('hover');
  }

  onHoverEnd() {
    this.DOMNode.classList.remove('hover');
  }

  updateComponentDisplay(props) {
    this.transform.setOpacity(props.opacity != undefined ? props.opacity : 1);
    this.transform.setPosition(props.x, 0);
    this.transform.setDimensions(props.width, props.height);
  }

  componentDidMount() {
    super.componentDidMount();
    this.updateComponentDisplay(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateComponentDisplay(nextProps);
    window.setTimeout(() => {
      this.DOMNode.style.transition = 'transform 200ms linear';
    }, 0);
  }

  render() {
    return (<div className='grid-element'>{this.props.children}</div>);
  }
}

export default GridElement;
