'use strict';

// loading queue
var queue = require('../kue-queue.js').queue;

// loading delayed task helper
var delayed = require('./delayed');

// register your job here
queue.process('test normal', require('../jobs/test-normal.js'));
queue.process('test delayed', delayed.process(require('../jobs/test-delayed.js')));
queue.process('pack captions', delayed.process(require('../jobs/pack-captions.js')));

