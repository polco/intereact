import React from 'react';
import ReactDOM from 'react-dom';

class PluggableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.plugins = [];
  }

  addPlugin(plugin) {
    this.plugins.push(plugin);
    return plugin;
  }

  removePlugin(plugin) {
    let index = this.plugins.indexOf(plugin);
    if (index != -1) {
      this.plugins.splice(index, 1);
    }
  }

  componentDidMount() {
    this.DOMNode = ReactDOM.findDOMNode(this);
    for (var i = 0, len = this.plugins.length; i < len; i += 1) {
      this.plugins[i].componentDidMount(this.DOMNode, this)
    }
  }

  componentWillUnmount() {
    for (var i = 0, len = this.plugins.length; i < len; i += 1) {
      this.plugins[i].componentWillUnmount()
    }
  }
}

export default PluggableComponent;
