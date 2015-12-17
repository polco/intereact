import TapPlugin from 'components/TapPlugin';
import DragPlugin from 'components/DragPlugin';
import PluggableComponent from 'components/PluggableComponent';
import TransformPlugin from 'components/TransformPlugin';

class GridElement extends PluggableComponent {
  constructor(props) {
    super(props);

    this.addPlugin(new TapPlugin());
    this.dragPlugin = this.addPlugin(new DragPlugin({ template: this.props.children, source: 'scrapbook' }));
    this.transform = this.addPlugin(new TransformPlugin());

    this.opened = false;
  }

  onTap() {
    this.DOMNode.classList.toggle('selected');
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
