'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

//
var config = require('./config');

// loading queue
var queue = require('./queue');

// registering jobs
queue.process('test', require('./jobs/test'));
queue.process('pack captions', require('./jobs/pack-captions'));

// global error handler
process.once('uncaughtException', function (err) {
  console.error( 'Something bad happened: ', err, (err && err.stack) );
  queue.shutdown(1000, function (err) {
    console.error('Kue shutdown result: ', err || 'OK' );
    process.exit(0);
  });
});

// default app
var app = require('./app/');
// mounting kue api on /api
var kue = require('kue');
app.use('/api', kue.app);
// spawn server
app.listen(config.port);