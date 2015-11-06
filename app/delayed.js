'use strict';

var delayedCallbacks = { /* jobId : done */};

var kue = require('../kue-queue.js').kue;

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
      callback(new Error('job status was not active'));
    }
  });
};

var success = function (jobId, callback) {
  updateStatus(jobId, undefined, callback);
};

var error = function (jobId, message, callback) {
  updateStatus(jobId, message || 'unknown error', callback);
};

module.exports.process = process;
module.exports.success = success;
module.exports.error = error;