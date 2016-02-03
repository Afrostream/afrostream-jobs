'use strict';

var config = require('./config');

var kue = require('kue')
  , queue = kue.createQueue(config.redis);

// redis connections can be unstable
// https://github.com/Automattic/kue#unstable-redis-connections
queue.watchStuckJobs(1000);

// error handling: global try/catch with restart...
queue.on('error', console.error.bind(console));

module.exports = { kue: kue, queue: queue };