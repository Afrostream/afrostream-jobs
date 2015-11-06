'use strict';

module.exports = function (job, ctx, done) {
  console.log('processing test.normal');
  job.subscribe(function () {
    job.on('remove', function () {
      console.log('removed');
    });
    job.on('failed', function () {
      console.log('failed');
    });
    job.on('failed attempt', function () {
      console.log('failed attempt');
    });
    job.on('complete', function () {
      console.log('complete');
    });
  });
  setTimeout(function () { done(null, "success!"); }, 1000);
};