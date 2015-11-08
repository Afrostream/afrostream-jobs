'use strict';

module.exports = function (job, ctx) {
  console.log('processing test delayed');
  setTimeout(function () {
    // simulating call to afrostream-packaging & answer after 50s
    require('../app/delayed.js').success(job.id, function () {});
  }, 50000);
};