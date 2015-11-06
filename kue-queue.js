'use strict';

var config = require('./config');

var kue = require('kue')
  , queue = kue.createQueue(config.redis);

// error handling: global try/catch with restart...
queue.on('error', console.error.bind(console));

module.exports = { kue: kue, queue: queue };