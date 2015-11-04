'use strict';

module.exports = function (job, ctx, done) {
  setTimeout(function () { done(null, "success!"); }, 5000);
};