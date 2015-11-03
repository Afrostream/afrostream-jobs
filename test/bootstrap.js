'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

var config = require('../config');

if (config.env !== 'test') {
  console.error('test should only be run on test env ! (current NODE_ENV=' + process.env.NODE_ENV + ')');
  process.exit(0);
}

