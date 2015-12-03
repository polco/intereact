import React from 'react';
// import ReactDOM from 'react-dom';
import PluggableComponent from 'components/PluggableComponent';
import DropPlugin from 'components/DropPlugin';
import MoodboardItem from 'components/MoodboardItem';
import './Moodboard.less';


export class Moodboard extends PluggableComponent {
  constructor(props) {
    super(props);

    this.state = { itemsOpacity: {} };
    this.addPlugin(new DropPlugin());
  }

  willDrop(dragPlugin, x, y) {
    let props = dragPlugin.reactComponent.props;
    let boundingRect = this.DOMNode.getBoundingClientRect();

    if (dragPlugin.source === 'moodboard') {
      let transform = dragPlugin.reactComponent.transform;
      let newX = x - boundingRect.left - transform.width / 2;
      let newY = y - boundingRect.top - transform.height / 2;
      this.props.transformItem({ type: 'moodboard', id: this.props.id }, { itemId: props.id }, { x: newX, y: newY });
    } else if (dragPlugin.source === 'scrapbook') {
      let newX = x - boundingRect.left - props.width / 2;
      let newY = y - boundingRect.top - props.height / 2;
      this.props.moveItem({ x: newX, y: newY, width: props.width, height: props.height, type: 'image', content: props.cell, id: props.cell.id }, { type: 'scrapbook', element: dragPlugin.reactComponent }, { type: 'moodboard', id: this.props.id });
      let itemsOpacity = this.state.itemsOpacity;
      itemsOpacity[props.cell.id] = 0;
      this.setState({ itemsOpacity });
    } else {
      console.error('unhandled drag source')
    }
  }

  didDrop() {
    let itemsOpacity = this.state.itemsOpacity;
    for (let itemId in itemsOpacity) {
      itemsOpacity[itemId] = 1;
    }
    this.setState({ itemsOpacity });
  }

  render() {

    let items = this.props.items;

    return (
      <div className='moodboard'>{
        Object.keys(items).map((itemId) => {
          return (<MoodboardItem key={itemId} id={itemId} moodboardId={this.props.id} item={items[itemId]} opacity={this.state.itemsOpacity[itemId]} />);
        })
      }</div>
    );
  }
}

export default Moodboard;
