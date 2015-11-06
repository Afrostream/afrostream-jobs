'use strict';

module.exports = function (job, ctx) {
  console.log('processing pack-captions');
  job.subscribe(function () {
    job.on('job process: remove', function () {
      console.log('removed');
    });
    job.on('job process: failed', function () {
      console.log('failed');
    });
    job.on('job process: failed attempt', function () {
      console.log('failed attempt');
    });
    job.on('job process: complete', function () {
      console.log('complete');
    });
  });
};