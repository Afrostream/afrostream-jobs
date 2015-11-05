'use strict';

var config = require('./config');

var kue = require('kue')
  , queue = kue.createQueue(config.redis);

// error handling: global try/catch with restart...
queue.on('error', console.error.bind(console));

// patch
kue.app.put('/jobs/:id/status', require('body-parser').json(), function (req, res, next) {
  switch (req.body.status) {
    case 'success':
      kue.Job.get(req.params.id, function(err, job){
        if (err) return next(new Error('unknown job'));
        if (job.state() === 'active') {
          job.complete();
          return res.status(200).send('');
        } else {
          return next(new Error('job status was not active'));
        }
      });
      break;
    case 'error':
      kue.Job.get(req.params.id, function(err, job){
        if (err) return next(new Error('unknown job'));
        if (job.state() === 'active') {
          job.failed();
          return res.status(200).send('');
        } else {
          return next(new Error('job status was not active'));
        }
      });
      break;
    default:
      return next(new Error('missing status'));
  }
});

module.exports = { kue: kue, queue: queue };