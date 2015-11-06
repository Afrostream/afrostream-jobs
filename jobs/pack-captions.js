'use strict';

module.exports = function (job, ctx) {
  console.log('processing pack-captions');
  setTimeout(function () {
    // simulating call to afrostream-packaging & answer after 5s
    require('../app/delayed.js').success(job.id, function () {});
  }, 5000);
};