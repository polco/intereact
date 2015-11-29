import { getTap, tapEvents, currentTap } from 'components/tapHelper';
import { EventEmitter } from 'events';

var isListening;

var lastTouchedElements;
var currentTouchedElements;
var topElement;
var lastTouchedDom;
let bodyPlugin = {
  tapEnter: function() {},
  tapLeave: function () {},
  hoverEnd: function() {}
};

var current = {
  x: 0,
  y: 0,
  count: 0,
  topElement: null,
  touchedElements: null
};

var wasHandled = false;

function touchOnSameElement() {
  wasHandled = true;
}

function touching() {
  if (!wasHandled) {
    return;
  }
  wasHandled = false;

  // retrieve the dom element at the touched location
  var touchedDomElement = document.elementFromPoint(currentTap.x, currentTap.y);
  if (!touchedDomElement) {
    wasHandled = true;
    return;
  }

  if (touchedDomElement === lastTouchedDom) { // we touched the same element => bypass the event emitting system
    touchOnSameElement();
    return;
  }

  lastTouchedDom = touchedDomElement;
  currentTouchedElements = current.touchedElements = [];

  var event = document.createEvent('Event');
  event.initEvent('hover', true, true);
  touchedDomElement.dispatchEvent(event);
}

var lastStepX = 0, lastStepY = 0, lastTimestamp = 0;
function touchMove(e) {
  let tap = getTap(e);
  if (Math.abs(tap.x - lastStepX) > 15 || Math.abs(tap.y - lastStepY) > 15 || e.timeStamp - lastTimestamp > 50) {
    lastStepX = tap.x;
    lastStepY = tap.y;
    touching();
  }
  lastTimestamp = e.timeStamp;
}

var stopListening;

function touchEnd(e) {
  let tap = getTap(e);
  if (tap.count === 0) {
    for (var i = 0, len = lastTouchedElements.length; i < len; i += 1) {
      lastTouchedElements[i].hoverEnd();
    }
    stopListening();
  }
}



/**
 * we loop through the elements ordered by lower hierarchy.
 * if a element and his same-level predecessor are different, we know all its children are different from their
 * respective same-level predecessor.
 *
 */
function handleTouch() {
  currentTouchedElements.push(bodyPlugin); // might need to remove that in the future
  topElement = current.topElement = currentTouchedElements[0];

  var currentIndex = currentTouchedElements.length - 1;
  var lastIndex = lastTouchedElements.length - 1;

  for (var i = Math.max(currentIndex, lastIndex); i >= 0; i -= 1) {
    var lastElement = lastTouchedElements[lastIndex];
    var currentElement = currentTouchedElements[currentIndex];

    if (lastElement !== currentElement) {
      if (lastElement) {
        lastElement.tapLeave(current);
      }

      if (currentElement) {
        currentElement.tapEnter(current);
      }
    }

    lastIndex -= 1;
    currentIndex -= 1;
  }

  lastTouchedElements = currentTouchedElements;
  wasHandled = true;
}

function startListening() {
  if (isListening || currentTap.count === 0) { return; }
  isListening = true;

  lastTouchedElements = [];
  currentTouchedElements = [];
  lastTouchedDom = null;
  topElement = null;
  wasHandled = true;
  document.body.addEventListener(tapEvents.move, touchMove);
  document.body.addEventListener(tapEvents.end, touchEnd);
}

stopListening = function () {
  if (!isListening) { return; }
  isListening = false;
  document.body.removeEventListener(tapEvents.move, touchMove);
  document.body.removeEventListener(tapEvents.end, touchEnd);
};


/**
 * To be called by the HoverPlugin when an element in being touched
 * @param {HoverPlugin} hoverPlugin
 */
function hovering(hoverPlugin) {
  startListening();

  if (topElement === hoverPlugin && !currentTouchedElements.length) { // the top element is the same.
    event.stopPropagation();
    return touchOnSameElement();
  }

  currentTouchedElements.push(hoverPlugin);
}

document.body.addEventListener('hover', handleTouch);

export {
  hovering,
  startListening as startHovering,
  stopListening as stopHovering
};
