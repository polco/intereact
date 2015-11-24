import React from 'react';
import ReactDOM from 'react-dom';
import TapPlugin from 'components/TapPlugin'

function tapStart() {
  this.DOMNode.classList.add('pressed');
}

function tapEnd() {
  this.DOMNode.classList.remove('pressed');
}

class Button extends React.Component {
  constructor(props) {
    super(props);
    this.tap = new TapPlugin();

    this.tap.on('tapStart', tapStart);
    this.tap.on('tapEnd', tapEnd);
  }

  componentDidMount() {
    this.tap.componentDidMount(ReactDOM.findDOMNode(this));
  }

  componentWillUnmount() {
    this.tap.componentWillUnmount();
  }

  render() {
    return (
      <div>{this.props.children}</div>
    )
  }
}

export default Button;
