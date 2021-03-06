import React from 'react';
import ReactDom from 'react-dom';

function plug(plugins, reactComponentClass) {

  class PlugDecorator extends React.Component {
    constructor(props, context) {
      super(props, context);
      let pluginInstances = {};

      for (let pluginId in plugins) {
        pluginInstances[pluginId] = new plugins[pluginId](this);
      }

      this.plugins = pluginInstances;
    }

    componentDidMount() {
      let DOMNode = ReactDom.findDOMNode(this.reactComponentInstance);
      for (let pluginId in this.plugins) {
        this.plugins[pluginId].setAttachedComponent(this.reactComponentInstance, DOMNode);
      }
    }

    componentWillUnmount() {
      for (let pluginId in this.plugins) {
        this.plugins[pluginId].tearDown();
      }
    }

    render() {
      return (<PlugDecorator.reactComponentClass ref={(ref) => { this.reactComponentInstance = ref; }} {...this.plugins} {...this.props} {...this.state} />);
    }
  }

  PlugDecorator.reactComponentClass = reactComponentClass;
  return PlugDecorator;
}

export default plug;
