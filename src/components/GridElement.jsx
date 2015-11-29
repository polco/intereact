import TapPlugin from 'components/TapPlugin';
import DragPlugin from 'components/DragPlugin';
import PluggableComponent from 'components/PluggableComponent';
import TransformPlugin from 'components/TransformPlugin';

class GridElement extends PluggableComponent {
  constructor(props) {
    super(props);

    this.addPlugin(new TapPlugin());
    this.addPlugin(new DragPlugin(this.props.children));
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
    // this.transform.scaleTo(0.7);
    // this.DOMNode.style.opacity = 0.5;
  }

  onDragEnd() {
    // this.DOMNode.style.opacity = 1;
    // this.transform.scaleTo(1);
  }

  onTapStart() {
    this.DOMNode.classList.add('pressed');
  }

  onTapEnd() {
    this.DOMNode.classList.remove('pressed');
  }

  onDragEnter(dragPlugin) {
    this.DOMNode.classList.add('hover');
  }

  onDragLeave() {
    this.DOMNode.classList.remove('hover');
  }

  onHoverEnd() {
    this.DOMNode.classList.remove('hover');
  }

  updateComponentDisplay(props) {
    this.transform.setOpacity(props.hasOwnProperty('opacity') ? props.opacity : 1);
    this.transform.setPosition(props.x, 0);
    this.transform.setDimensions(props.width, props.height);
  }

  componentDidMount() {
    super.componentDidMount();
    this.updateComponentDisplay(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateComponentDisplay(nextProps);
  }

  render() {
    return (<div className='grid-element'>{this.props.children}</div>);
  }
}

export default GridElement;
