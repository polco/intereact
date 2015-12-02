import React from 'react';
// import ReactDOM from 'react-dom';
import PluggableComponent from 'components/PluggableComponent';
import DragPlugin from 'components/DragPlugin';
import TransformPlugin from 'components/TransformPlugin'
import './MoodboardItem.less';

export class MoodboardItem extends PluggableComponent {
  constructor(props) {
    super(props);

    this.dragPlugin = this.addPlugin(new DragPlugin());
    this.transform = this.addPlugin(new TransformPlugin());
  }

  updateDisplay(props) {
    this.transform.setPosition(props.item.x, props.item.y);
    this.transform.setDimensions(props.item.width, props.item.height);
    this.transform.setOpacity(props.opacity != undefined ? props.opacity : 1);
    this.dragPlugin.setSource(props.moodboardId);
  }

  componentWillReceiveProps(nextProps) {
    this.updateDisplay(nextProps)
  }

  componentDidMount() {
    super.componentDidMount();
    this.updateDisplay(this.props);
    // this.dragPlugin.setTemplate(this.DOMNode);
  }

  render() {
    let content;
    let item = this.props.item;
    if (item.cell) {
      let style = {
        height: '100%',
        backgroundSize: '100% 100%',
        backgroundImage: 'url(' + item.cell.backgroundImage + ')'
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
