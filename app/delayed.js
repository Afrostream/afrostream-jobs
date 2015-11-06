'use strict';

var delayedCallbacks = { /* jobId : done */};

var process = function (process, timeout) {
  return function (job, ctx, done) {
    delayedCallbacks[job.id] = done;
    return process(job, ctx);
  };
};

var getCallback = function (jobId) {
  var f = delayedCallbacks[jobId];
  if (f) {
    // avoid leak
    return function () {
      delayedCallbacks[jobId] = null;
      return f.apply(null, arguments);
    };
  }
  return f;
};

module.exports.process = process;
module.exports.getCallback = getCallback;