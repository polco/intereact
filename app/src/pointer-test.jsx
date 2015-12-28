import React from 'react';
import ReactDom from 'react-dom';
import { addListener, removeListener } from 'events/main.js';
import 'styles/main.less';

var listenerType = 'pointerup';

class PointerTest extends React.Component {

  onPointerDown(e) {
    console.log(e);
  }

  onPointerEnter(e) {
    console.log('pointer enter');
  }

  onPointerLeave(e) {
    console.log('pointer leave');
  }

  componentDidMount() {
    this.DOMNode = ReactDom.findDOMNode(this);

    // this.DOMNode.addListener(listenerType, this.onPointerDown, { context: this });
    // addListener(this.DOMNode, listenerType, this.onMouseDown, { context: this });
    // addListener(this.refs.firstLevel, listenerType, this.onMouseDown, { context: this });
    // addListener(this.refs.secondLevelA, 'pointerdown', this.onMouseDown, { context: this });
    // addListener(this.refs.secondLevelA, 'pointerdown', this.onMouseDown2, { context: this });
    // addListener(this.refs.secondLevelA, 'pointerup', this.onMouseDown2, { context: this });
    addListener(this.refs.secondLevelB, 'pointerenter', this.onPointerEnter, { context: this });
    addListener(this.refs.secondLevelB, 'pointerleave', this.onPointerLeave, { context: this });
  }

  componentWillUnmount() {
    // this.DOMNode.removeListener(listenerType, this.onPointerDown);
    // removeListener(this.DOMNode, listenerType, this.onMouseDown);
    // removeListener(this.refs.firstLevel, listenerType, this.onMouseDown);
    // removeListener(this.refs.secondLevelA, 'pointerdown', this.onMouseDown);
    removeListener(this.refs.secondLevelB, 'pointerenter', this.onPointerEnter);
    removeListener(this.refs.secondLevelB, 'pointerleave', this.onPointerLeave);
  }

  render() {
    return (
      <div className='pointer-test' style={ { height: '100%'} }>
        <div className='first level' ref='firstLevel' style={ { height: '100%'} }>
          <div className='second level a' ref='secondLevelA' style={ { height: '50%'} }>
          </div>
          <div className='second level b' ref='secondLevelB' style={ { height: '50%'} }>
          </div>
        </div>
      </div>
    );
  }
};


export default PointerTest;
