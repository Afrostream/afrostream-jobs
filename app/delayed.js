'use strict';

var assert = require('better-assert');

var delayedCallbacks = { /* jobId : done */};
var delayedCallbacksTimeout = { /* jobId: timeoutId */};

var kue = require('../kue-queue.js').kue;

var getCallback = function (jobId) {
  var f = delayedCallbacks[jobId];
  if (f) {
    // avoid leak & handle timeout
    return function () {
      delayedCallbacks[jobId] = null;
      clearTimeout(delayedCallbacksTimeout[jobId]);
      delayedCallbacksTimeout[jobId] = null;
      return f.apply(null, arguments);
    };
  }
  return f;
};

var updateStatus = function (jobId, error, callback) {
  kue.Job.get(jobId, function(err, job){
    if (err) {
      return callback(new Error('unknown job'));
    }
    if (job.state() === 'active') {
      var done = getCallback(job.id);
      if (done) {
        done(error);
        callback();
      } else {
        callback(new Error('internal server error - missing delayed callback'));
      }
    } else {
      callback(new Error('job status is not active'));
    }
  });
};

var success = function (jobId, callback) {
  updateStatus(jobId, undefined, callback);
};

var error = function (jobId, message, callback) {
  updateStatus(jobId, message || 'unknown error', callback);
};

var process = function (process, timeout) {
  timeout = timeout || 60000;
  return function (job, ctx, done) {
    assert(!delayedCallbacks[job.id]); // once at a time.
    delayedCallbacks[job.id] = done;
    delayedCallbacksTimeout = setTimeout(function () {
      error(job.id, 'timeout', function () { });
    }, timeout);
    return process(job, ctx);
  };
};

module.exports.process = process;
module.exports.success = success;
module.exports.error = error;