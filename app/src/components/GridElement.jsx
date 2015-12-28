import React from 'react';
import ButtonPlugin from 'spur-button-plugin';
import classNames from 'classnames';
import DragPlugin from 'plugins/DragPlugin';
import TransformPlugin from 'plugins/TransformPlugin';
import plug from 'plugins/plug';

class GridElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = { transformStyle: {}, selected: false };
  }

  onTap() {
    this.setState({ selected: true });
  }

  updateComponentDisplay(props) {
    props.transform.setOpacity(props.opacity != undefined ? props.opacity : 1);
    props.transform.setPosition(props.x, 0);
    props.transform.setDimensions(props.width, props.height);
  }

  componentWillMount() {
    this.props.drag.setTemplate(this.props.children);
    this.props.drag.setSource('scrapbook');
  }

  componentDidMount() {
    this.updateComponentDisplay(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateComponentDisplay(nextProps);
    this.props.transform.setTransition('transform 200ms linear');
  }

  render() {
    return (<div className={classNames('grid-element',  { selected: this.state.selected })} style={this.state.transformStyle}>{this.props.children}</div>);
  }
}

export default plug({ transform: TransformPlugin, button: ButtonPlugin, drag: DragPlugin }, GridElement);
