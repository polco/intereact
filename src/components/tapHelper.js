let canTouch = false;
if ('ontouchstart' in window) {
  canTouch = true;
}

let currentTap = {
  x: 0,
  y: 0,
  taps: [],
  count: 0
};

let getTap;
if (canTouch) {
  getTap = function (e) {
    var tapList = e.touches || [];
    var tapCount = tapList.length;
    var taps = [];

    currentTap.count = tapCount;
    currentTap.tapList = taps;

    if (tapCount > 0) {
      for (var i = 0; i < tapCount; i += 1) {
        taps.push({ x: tapList[i].clientX, y: tapList[i].clientY });
      }

      currentTap.x = taps[0].x;
      currentTap.y = taps[0].y;
    }

    return currentTap;
  };
} else {
  getTap = function (e) {
    currentTap.x = e.clientX;
    currentTap.y = e.clientY;
    currentTap.count = e.type === 'mouseup' ? 0 : 1;
    currentTap.taps = e.type === 'mouseup' ? [] : [{ x: currentTap.x, y: currentTap.y }];
    return currentTap;
  };
}

var events = {
  start: canTouch ? 'touchstart' : 'mousedown',
  move: canTouch ? 'touchmove' : 'mousemove',
  end: canTouch ? 'touchend' : 'mouseup'
};

export {
  canTouch,
  getTap,
  currentTap,
  events as tapEvents
};
