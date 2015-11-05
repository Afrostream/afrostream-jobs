'use strict';

module.exports = function (job, ctx, done) {
  // we will wait 60 sec max until job is complete.
  setTimeout(function () { done(null, "success!"); }, 5000);
};