'use strict';

var config = require('../config');

var express = require('express')
  , app = express();

var basicAuth = require('basic-auth-connect');

app.use(require('./middlewares/middleware-accesscontrol.js')());
app.use(require('./middlewares/middleware-options.js')());
app.use(basicAuth(config.app.basicAuth.user, config.app.basicAuth.password));
if (config.app.middlewareEnsureHttps) {
  app.use(require('./middlewares/middleware-options.js')());
}

// loading queue
var kue = require('../kue-queue.js').kue;
var queue = require('../kue-queue.js').queue;

// register your job here
queue.process('test', require('../jobs/test'));
queue.process('pack captions', require('../jobs/pack-captions'));

// mounting kue api on /api
app.use('/api', kue.app);

// global error handler
process.once('uncaughtException', function (err) {
  console.error( 'Something bad happened: ', err, (err && err.stack) );
  queue.shutdown(1000, function (err) {
    console.error('Kue shutdown result: ', err || 'OK' );
    process.exit(0);
  });
});

module.exports = app;