'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// default app
var app = require('./app/');

// spawn server
var config = require('./config');
app.listen(config.port, function () {
  console.log('listening on port ' + config.port);
});