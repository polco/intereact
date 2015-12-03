import React from 'react';
// import ReactDOM from 'react-dom';
import PluggableComponent from 'components/PluggableComponent';
import DragPlugin from 'components/DragPlugin';
import TapPlugin from 'components/TapPlugin';
import TransformPlugin from 'components/TransformPlugin'
import './MoodboardItem.less';

export class MoodboardItem extends PluggableComponent {
  constructor(props) {
    super(props);

    this.dragPlugin = this.addPlugin(new DragPlugin({ scale: 1, time: 1 }));
    this.addPlugin(new TapPlugin());
    this.dragPlugin.setSource('moodboard');
    this.transform = this.addPlugin(new TransformPlugin());
  }

  updateDisplay(props) {
    this.transform.setPosition(props.item.x, props.item.y);
    this.transform.setDimensions(props.item.width, props.item.height);
    this.transform.setOpacity(props.opacity != undefined ? props.opacity : 1);
  }

  componentWillReceiveProps(nextProps) {
    this.updateDisplay(nextProps)
  }

  onWheel(e) {
    let w=e.wheelDelta, d=e.detail;
    let distance = 1;
    if (d){
      if (w) distance = w / d / 40 * d > 0 ? 1 : -1; // Opera
      else distance = -d / 3;              // Firefox;         TODO: do not /3 for OS X
    } else distance = w / 120;

    let scale = Math.max(0.5, this.transform.scale + distance / 20);
    this.transform.setScale(scale);
    e.preventDefault();
    e.stopPropagation();

    window.clearTimeout(this.wheelTimeout);
    this.wheelTimeout = window.setTimeout(() => {
      let scale = this.transform.scale;
      let newWidth = this.transform.width * scale;
      let newHeight = this.transform.height * scale;
      let x = this.transform.x + (this.transform.width - newWidth) / 2;
      let y = this.transform.y + (this.transform.height - newHeight) / 2;
      this.props.updateItemDimensions(this.props.moodboardId, this.props.id, newWidth, newHeight, x, y);
      this.transform.setScale(1);
    }, 500);
  }

  componentDidMount() {
    super.componentDidMount();
    this.updateDisplay(this.props);

    this._boundWheel = this.onWheel.bind(this);
    this.DOMNode.addEventListener('wheel', this._boundWheel);
  }

  componentWillUnmount() {
    this.DOMNode.removeEventListener('wheel', this._boundWheel);
    this._boundWheel = null;
    super.componentWillUnmount();
  }

  onTapStart() {
    this.props.putInFront(this.props.moodboardId, this.props.id);
  }

  render() {
    let content;
    let item = this.props.item;
    if (item.type === 'image') {
      this.content = item.content;
      let style = {
        height: '100%',
        backgroundSize: '100% 100%',
        backgroundImage: 'url(' + item.content.backgroundImage + ')'
      }
      content = (<div className='image' style={style}></div>);
    } else {
      content = '<div>unknown content</div>';
    }
    this.dragPlugin.setTemplate(content);
    return (
      <div className='moodboard-item'>{content}</div>
    );
  }
}

export default MoodboardItem;
