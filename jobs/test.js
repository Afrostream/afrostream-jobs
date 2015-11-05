'use strict';

module.exports = function (job, ctx, done) {
  /*
  job.on('complete', function(result){
    console.log('Job completed with data ', result);

  }).on('failed attempt', function(errorMessage, doneAttempts){
    console.log('Job failed');

  }).on('failed', function(errorMessage){
    console.log('Job failed');

  }).on('progress', function(progress, data){
    console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );

  });
  */
  setTimeout(function () { done(null, "success!"); }, 1000);
};