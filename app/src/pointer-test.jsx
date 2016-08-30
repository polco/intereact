import React from 'react';
import ReactDom from 'react-dom';
import { addListener, removeListener, removeListenerById, removeAllListeners, PointerEvent, dispatch } from 'events/index.js';
import 'styles/main.less';

var listenerType = 'pointerup';

class PointerTest extends React.Component {

  onPointerEnter(e) {
    e.target.classList.add('hover');
    console.log('enter')
  }

  onPointerLeave(e) {
    e.target.classList.remove('hover');
    console.log('leave')
  }

  onPointerDown(e) {
    console.log('pointer down');
  }

  onPointerUp(e) {
    console.log('pointer up');
  }

  onPointerOut(e) {
    console.log('pointer out');
  }

  onPointerOver(e) {
    console.log('pointer over');
  }

  onPointer(e) {
    console.log(e.type);
  }

  componentDidMount() {

    var start;
    function checkPropagationtime() {
      console.log('propagation time', (performance.now() - start))
    }

    // addListener(this.refs.lastLevel, 'pointerdown', function () {
    //   start = performance.now();
    //   console.log('hit last level')
    // }, { context: this, capture: true });

    // addListener(this.refs.firstLevel, 'pointerout', this.onPointer, { context: this });
    // addListener(this.refs.firstLevel, 'pointerover', this.onPointer, { context: this });
    // addListener(this.refs.firstLevel, 'pointerup', this.onPointer, { context: this });
    // addListener(this.refs.firstLevel, 'pointerdown', checkPropagationtime, { context: this });

    // addListener(this.refs.firstLevel, 'pointerenter', this.onPointerEnter);
    // addListener(this.refs.firstLevel, 'pointerleave', this.onPointerLeave);

    // addListener(this.refs.secondLevelB, 'pointerenter', this.onPointerEnter);
    // addListener(this.refs.secondLevelB, 'pointerleave', this.onPointerLeave);

    // addListener(this.refs.secondLevelA, 'pointerenter', this.onPointerEnter, {  id: 'test' });
    // addListener(this.refs.secondLevelA, 'pointerleave', this.onPointerLeave);
    // addListener(window, 'pointerdown', this.onPointerDown);
    this.refs.firstLevel.addEventListener('click', function () { console.log('click') });

    // var event = new PointerEvent('pointerdown');
    // // event.target = this.refs.firstLevel;

    // dispatch(event);

    // removeAllListeners(this.refs.secondLevelA, 'pointerenter');

    // this.refs.lastLevel.addEventListener('pointerdown', function () {
    //   start = performance.now();
    //   console.log('hit last level')
    // }, true);

    // this.refs.firstLevel.addEventListener('pointerout', this.onPointer);
    // this.refs.firstLevel.addEventListener('pointerover', this.onPointer);
    // this.refs.firstLevel.addEventListener('pointerup', this.onPointer);
    // this.refs.firstLevel.addEventListener('pointerdown', checkPropagationtime);

    // this.refs.firstLevel.addEventListener('pointerenter', this.onPointerEnter);
    // this.refs.firstLevel.addEventListener('pointerleave', this.onPointerLeave);

    // this.refs.secondLevelB.addEventListener('pointerenter', this.onPointerEnter);
    // this.refs.secondLevelB.addEventListener('pointerleave', this.onPointerLeave);

    // this.refs.secondLevelA.addEventListener('pointerenter', this.onPointerEnter);
    // this.refs.secondLevelA.addEventListener('pointerleave', this.onPointerLeave);

    // this.refs.secondLevelB.addEventListener('mouseout', function () { console.log('out') }, false);
    // this.refs.secondLevelB.addEventListener('mouseup', function () { console.log('up') }, false);
    // this.refs.secondLevelB.addEventListener('mousedown', function () { console.log('down') }, false);
    // this.refs.secondLevelB.addEventListener('mouseenter', function () { console.log('enter') }, false);
    // this.refs.secondLevelB.addEventListener('mouseleave', function () { console.log('leave') }, false);
  }

  componentWillUnmount() {
    // this.DOMNode.removeListener(listenerType, this.onPointerDown);
    // removeListener(this.DOMNode, listenerType, this.onMouseDown);
    // removeListener(this.refs.firstLevel, listenerType, this.onMouseDown);
    // removeListener(this.refs.secondLevelA, 'pointerdown', this.onMouseDown);
    // removeListener(this.refs.secondLevelB, 'pointerenter', this.onPointerEnter);
    // removeListener(this.refs.secondLevelB, 'pointerleave', this.onPointerLeave);
  }

  render() {

    function createChild(count) {
      if (count === 0) {
        return (<div ref='lastLevel'>test</div>);
      }
      return (<div>{createChild(count - 1)}</div>)
    }

    return (
      <div className='pointer-test'>
        <div className='first-level' ref='firstLevel'>
          <div className='second-level a' ref='secondLevelA'>
          {
            createChild(10)
          }
          </div>
          <div className='second-level b' ref='secondLevelB'>
          </div>
        </div>
      </div>
    );
  }
};


export default PointerTest;
