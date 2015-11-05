'use strict';

/*globals rootRequire*/
/*globals btoa*/
/*globals describe, it */

var assert = require('better-assert');

var bootstrap = require('../bootstrap.js');

var request = require('supertest');

var q = require('q');

var assertNbJobs = function (queue, nbJobs, done) {
  return q.delay(20).then(function () {
    return q.all([
      q.ninvoke(queue, 'active'),
      q.ninvoke(queue, 'complete'),
      q.ninvoke(queue, 'failed'),
      q.ninvoke(queue, 'delayed')
    ]).then(function (results) {
      var result = results.reduce(function (p, c) { return p + c.length; }, 0);
      if (result !== nbJobs) { console.error('result ', result, ' nbJobs', nbJobs); }
      assert(result === nbJobs);
    });
  });
};

var app = bootstrap.getApp();

var queue = rootRequire('kue-queue.js').queue;

var config = rootRequire('config');
var authorization = "Basic " + btoa(config.app.basicAuth.user+':'+config.app.basicAuth.password);

describe('job "pack captions"', function () {
  describe('create a job', function () {
    describe('POST /api/job/', function () {
      it('should have no existing jobs before the POST', function () {
        return assertNbJobs(queue, 0);
      });

      it('should answer 200OK', function (done) {
        request(app)
          .post('/api/job')
          .set("Authorization", authorization)
          .set("Content-Type", "application/json")
          .set('Accept', 'application/json')
          .send({
            "type": "pack captions",
            "data": {
              "videoId": 4242,
              "encodingId": 4242,
              captions: [
                {"ISO6392T": "fra", src: "http://whatever"},
                {"ISO6392T": "eng", src: "http://whatever2"}
              ]
            },
            "options": {
              "attempts": 3,
              "priority": "high"
            }
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            console.log(res.body, res.statusCode);
            assert(res.body.id);
            assert(res.body.message === 'job created');

            assertNbJobs(queue, 1).toDone(done);
          });
      });
    });
  });
});