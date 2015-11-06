'use strict';

var kue = require('../kue-queue.js').kue;
var queue = require('../kue-queue.js').queue;

var delayed = require('./delayed.js');

// patch
kue.app.put('/job/:id/status', require('body-parser').json(), function (req, res, next) {
  var error;
  switch (req.body.status) {
    case 'success':
      break;
    case 'error':
      error = new Error(req.body.message || 'unknown error');
      break;
    default:
      return next(new Error('missing status'));
  }
  kue.Job.get(req.params.id, function(err, job){
    if (err) return next(new Error('unknown job'));
    if (job.state() === 'active') {
      var done = delayed.getCallback(job.id);
      if (done) {
        done(error);
        res.set('Content-type', 'application/json');
        return res.status(200).send('');
      } else {
        return next(new Error('internal server error - missing delayed callback'));
      }
    } else {
      return next(new Error('job status was not active'));
    }
  });
});

// global error handler
process.once('uncaughtException', function (err) {
  console.error( 'Something bad happened: ', err, (err && err.stack) );
  queue.shutdown(1000, function (err) {
    console.error('Kue shutdown result: ', err || 'OK' );
    process.exit(0);
  });
});

module.exports = kue.app;