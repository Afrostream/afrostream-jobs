'use strict';

/* globals before */

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

var config = require('../config');

if (config.env !== 'test') {
  console.error('test should only be run on test env ! (current NODE_ENV=' + process.env.NODE_ENV + ')');
  process.exit(0);
}

if (process.env.REDIS_URL) {
  console.error('this env var should not exist on your dev/test environment (avoid prod execution)');
  process.exit(0);
}

//
global.btoa = require('btoa');
global.rootRequire = function (name) { return require(__dirname + '/../' + (name[0] === '/' ? name.substr(1) : name)); };

// monkeypatching q
var q = require('q');
q.Promise.prototype.toDone = function (done) {
  return this.then(function () { done(); }, done);
};

//
module.exports.getApp = function () {
  return require('../app/index.js');
};

before(function removingAllKeys(done) {
  console.log('before: removing all redis keys "kue*" !!!'+"\n");
  //
  var redis = require("redis"),
    client = redis.createClient(config.redis.redis);

  client.keys(config.redis.prefix + "*", function (err, keys) {
    q.all(keys.map(function (key) {
      return q.ninvoke(client, 'del', key);
    })).then(
      function () { done(); },
      done
    );
  });
});