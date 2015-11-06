'use strict';

module.exports = function (job, ctx) {
  console.log('processing test.delayed');
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
};