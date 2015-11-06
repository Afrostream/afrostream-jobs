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

// mounting kue api on /api
app.use('/api', require('./kue-app.js'));

// load jobs
require('./jobs.js');

module.exports = app;