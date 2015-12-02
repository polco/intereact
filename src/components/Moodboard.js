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
    let transform = dragPlugin.reactComponent.transform;
    let props = dragPlugin.reactComponent.props;
    let boundingRect = this.DOMNode.getBoundingClientRect();

    if (dragPlugin.source === this.props.id) {
      let newX = x - boundingRect.left - transform.width / 2;
      let newY = y - boundingRect.top - transform.height / 2;
      this.props.transformItem(props.id, { x: newX, y: newY });
    } else {
      let newX = x - boundingRect.left - props.width / 2;
      let newY = y - boundingRect.top - props.height / 2;
      this.props.addItem({ x: newX, y: newY, width: props.width, height: props.height, cell: props.cell, id: props.cell.id });
      let itemsOpacity = this.state.itemsOpacity;
      itemsOpacity[props.cell.id] = 0;
      this.setState({ itemsOpacity });
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
