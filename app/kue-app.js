'use strict';

var kue = require('../kue-queue.js').kue;
var queue = require('../kue-queue.js').queue;

var delayed = require('./delayed.js');

// patch
kue.app.put('/job/:id/status', require('body-parser').json(), function (req, res, next) {
  var jobId = req.params.id;

  switch (req.body.status) {
    case 'success':
      delayed.success(jobId, function (err) {
        res.set('Content-type', 'application/json');
        if (err) { return res.status(500).json({error:String(err)}); }
        return res.status(200).send('');
      });
      break;
    case 'error':
      delayed.error(jobId, req.body.message, function (err) {
        res.set('Content-type', 'application/json');
        if (err) { return res.status(500).json({error:String(err)}); }
        return res.status(200).send('');
      });
      break;
    default:
      return next(new Error('missing status'));
  }
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