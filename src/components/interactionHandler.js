import { EventEmitter } from 'events';
import { tapEvents, getTap } from 'components/tapHelper';

var handle, isStillTapping;
var handler = new EventEmitter();

document.body.addEventListener(tapEvents.start, function () {
  if (isStillTapping) { return; }
  isStillTapping = true;
  handle = null;
}, true);

document.body.addEventListener(tapEvents.start, function (e) {
  e.preventDefault();
  if (handle) {
    handler.emit('handleTaken', handle);
  }
}, false);

document.body.addEventListener(tapEvents.move, function (e) {
  e.preventDefault();
});

document.body.addEventListener(tapEvents.end, function (e) {
  e.preventDefault();
  if (getTap(e).count === 0) {
    handle = null;
    isStillTapping = false;
  }
});

handler.isHandleFree = function () {
  return handle === null;
};

handler.hasHandle = function (element) {
  return handle === element;
};

handler.requestHandle = function (element) {
  if (handle) { return handle === element; }
  handle = element;
  handler.emit('handleTaken', handle);
  return true;
};

export default handler;
