'use strict';

// loading queue
var queue = require('../kue-queue.js').queue;

// loading delayed task helper
var delayed = require('./delayed');

// register your job here
queue.process('test normal', require('../jobs/test-normal.js'));
queue.process('test delayed', delayed.process(require('../jobs/test-delayed.js'), 2000));
queue.process('pack captions', require('../jobs/pack-captions.js'));

