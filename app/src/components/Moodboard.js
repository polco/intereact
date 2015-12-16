import React from 'react';
// import ReactDOM from 'react-dom';
import PluggableComponent from 'components/PluggableComponent';
import DropPlugin from 'components/DropPlugin';
import MoodboardItem from 'components/MoodboardItem';
import './Moodboard.less';


export class Moodboard extends PluggableComponent {
  constructor(props) {
    super(props);

    this.state = { itemsOpacity: {}, itemsOrder: {} };
    this.addPlugin(new DropPlugin());
  }

  willDrop(dragPlugin, x, y) {
    let props = dragPlugin.reactComponent.props;
    let boundingRect = this.DOMNode.getBoundingClientRect();
    let newX = x - boundingRect.left;
    let newY = y - boundingRect.top;

    if (dragPlugin.source === 'moodboard') {
      this.props.transformItem({ type: 'moodboard', id: this.props.id }, { itemId: props.id }, { x: newX, y: newY });
    } else if (dragPlugin.source === 'scrapbook') {
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
    return (
      <div className='moodboard'>{
        this.props.items.map((item) => {
          return (<MoodboardItem
            putInFront={this.props.putInFront.bind(this)}
            updateItemDimensions={this.props.updateItemDimensions.bind(this)}
            key={item.id}
            id={item.id}
            moodboardId={this.props.id}
            item={item}
            opacity={this.state.itemsOpacity[item.id]} />
          );
        })
      }</div>
    );
  }
}

export default Moodboard;
