'use strict';

var kue = require('../kue-queue.js').kue;
var queue = require('../kue-queue.js').queue;

var delayed = require('./delayed.js');

var Q = require('q');

// patch
kue.app.put('/job/:id/status', function (req, res, next) {
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

// manual cleanup
// http://afrostream-jobs.herokuapp.com/api/jobs/complete/cleanup?n=100
kue.app.get('/jobs/complete/cleanup', function (req, res) {
  var n = req.query.n || 50;

  Q.ninvoke(kue.Job, 'rangeByState', 'complete', 0, n, 'asc')
    .then(function (jobs) {
      return Q.all(jobs.map(function (job) {
        return Q.ninvoke(job, 'remove').then(function () { console.log('cleanup: removed ', job.id); });
      })).then(function () { return jobs.length; });
    })
    .then(
      function success(n) { res.json({ n: n }); }
    , function error(err) { res.status(500).json({error:err}); }
    );
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