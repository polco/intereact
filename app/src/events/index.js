var pointers = require('./current.js').pointers;
var domAPI = require('./dom-api.js');
var CustomPointerEvent  = require('./pointer-event.js');

if (window.PointerEvent) {
  require('./pointer.js');
} else {
  require('./touch.js');
  require('./mouse.js');
}

module.exports = {
  pointers: pointers,
  PointerEvent: CustomPointerEvent,
  dispatch: domAPI.dispatch,
  addListener: domAPI.addListener,
  removeListener: domAPI.removeListener,
  removeListenerById: domAPI.removeListenerById,
  removeAllListeners: domAPI.removeAllListeners
};
