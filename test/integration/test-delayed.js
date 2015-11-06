'use strict';

/*globals rootRequire*/
/*globals btoa*/
/*globals after, before, describe, it */

var assert = require('better-assert');

var bootstrap = require('../bootstrap.js');

var request = require('supertest');
var q = require('q');

var config = rootRequire('config');
var authorization = "Basic " + btoa(config.app.basicAuth.user+':'+config.app.basicAuth.password);

var kue, queue, app;
before(function () {
  // tricky: load after redis was cleaned by the bootstrap.
  kue = rootRequire('kue-queue.js').kue;
  queue = rootRequire('kue-queue.js').queue;
  app = bootstrap.getApp();
});

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

var removeJob = function (jobId) {
  return q.ninvoke(kue.Job, 'get', jobId)
    .then(function (job) {
      return q.ninvoke(job, 'remove');
    });
};

describe('job "pack captions"', function () {
  describe('create a job, update it from outside', function () {
    describe('create & update=success', function () {
      var jobId = null;

      describe('create: POST /api/job/', function () {
        it('should have no existing jobs before the POST', function () {
          return assertNbJobs(queue, 0);
        });

        it('should answer 200 OK and be created', function (done) {
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
              assert(res.body.id);
              assert(res.body.message === 'job created');

              if (err) return done(err);

              jobId = parseInt(res.body.id, 10);
              assert(jobId && jobId > 0);

              assertNbJobs(queue, 1).nodeify(done);
            });
        });

        it('should be processed immediatly...(job active)', function (done) {
          request(app)
            .get('/api/job/' + jobId)
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              assert(res.body.id === String(jobId));
              assert(res.body.type === 'pack captions');
              assert(res.body.state === 'active');
              done(err);
            });
        });
      });

      describe('update: PUT /api/job/:id/status with status=success', function () {
        it('should answer 200 OK', function (done) {
          request(app)
            .put('/api/job/' + jobId + '/status')
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .send({
              "status": "success"
            })
            .expect('Content-Type', /json/)
            .expect(200, done);
        });

        it('should have changed the job status', function (done) {
          request(app)
            .get('/api/job/' + jobId)
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              assert(res.body.id === String(jobId));
              assert(res.body.type === 'pack captions');
              assert(res.body.state === 'complete');
              done(err);
            });
        });
      });

      after(function () {
        return removeJob(jobId);
      });
    });

    describe('create & update=error', function () {
      var jobId = null;

      describe('create: POST /api/job/', function () {
        it('should have no existing jobs before the POST', function () {
          return assertNbJobs(queue, 0);
        });

        it('should answer 200 OK and be created', function (done) {
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
              assert(res.body.id);
              assert(res.body.message === 'job created');

              if (err) return done(err);

              jobId = parseInt(res.body.id, 10);
              assert(jobId && jobId > 0);

              assertNbJobs(queue, 1).nodeify(done);
            });
        });

        it('should be processed immediatly...(job active)', function (done) {
          request(app)
            .get('/api/job/' + jobId)
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              assert(res.body.id === String(jobId));
              assert(res.body.type === 'pack captions');
              assert(res.body.state === 'active');
              done(err);
            });
        });
      });

      describe('update: PUT /api/job/:id/status with status=error', function () {
        it('should answer 200 OK', function (done) {
          request(app)
            .put('/api/job/' + jobId + '/status')
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .send({
              "status": "error"
            })
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              if (err) return done(err);
              kue.Job.get(jobId, function (err, job) {
                assert(job.state() === 'failed');
                // after a short time, job should be active again.
                setTimeout(function () {
                  kue.Job.get(jobId, function (err, job) {
                    assert(job.state() === 'active');
                    done(err);
                  });
                }, 200);
              });
            });
        });

        it('should have changed the job status to active (because of 3 immediate retry)', function (done) {
          request(app)
            .get('/api/job/' + jobId)
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              assert(res.body.id === String(jobId));
              assert(res.body.type === 'pack captions');
              assert(res.body.state === 'active');
              done(err);
            });
        });
      });

      describe('update: PUT /api/job/:id/status with status=error (2nd time)', function () {
        it('should answer 200 OK', function (done) {
          request(app)
            .put('/api/job/' + jobId + '/status')
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .send({
              "status": "error"
            })
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              if (err) return done(err);
              kue.Job.get(jobId, function (err, job) {
                assert(job.state() === 'failed');
                // after a short time, job should be active again.
                setTimeout(function () {
                  kue.Job.get(jobId, function (err, job) {
                    assert(job.state() === 'active');
                    done(err);
                  });
                }, 200);
              });
            });
        });

        it('should have changed the job status to active (because of 3 immediate retry)', function (done) {
          request(app)
            .get('/api/job/' + jobId)
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              assert(res.body.id === String(jobId));
              assert(res.body.type === 'pack captions');
              assert(res.body.state === 'active');
              done(err);
            });
        });
      });

      describe('update: PUT /api/job/:id/status with status=error (3rd time)', function () {
        it('should answer 200 OK', function (done) {
          request(app)
            .put('/api/job/' + jobId + '/status')
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .send({
              "status": "error"
            })
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              if (err) return done(err);
              kue.Job.get(jobId, function (err, job) {
                assert(job.state() === 'failed');
                // after a short time, job should be active again.
                setTimeout(function () {
                  kue.Job.get(jobId, function (err, job) {
                    assert(job.state() === 'failed');
                    done(err);
                  });
                }, 200);
              });
            });
        });

        it('should have changed the job status to failed', function (done) {
          request(app)
            .get('/api/job/' + jobId)
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              assert(res.body.id === String(jobId));
              assert(res.body.type === 'pack captions');
              assert(res.body.state === 'failed');
              done(err);
            });
        });
      });

      describe('create: POST /api/job/ with BACKOFF', function () {
        it('should have only 1 existing jobs before the POST', function () {
          return assertNbJobs(queue, 1);
        });

        it('should answer 200 OK and be created', function (done) {
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
                "attempts": 2,
                "priority": "high",
                "backoff": {
                  delay: 1000,
                  type: "fixed"
                }
              }
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
              assert(res.body.id);
              assert(res.body.message === 'job created');

              if (err) return done(err);

              jobId = parseInt(res.body.id, 10);
              assert(jobId && jobId > 0);

              assertNbJobs(queue, 2).nodeify(done);
            });
        });

        it('should be processed immediatly...(job active)', function (done) {
          request(app)
            .get('/api/job/' + jobId)
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              assert(res.body.id === String(jobId));
              assert(res.body.type === 'pack captions');
              assert(res.body.state === 'active');
              done(err);
            });
        });
      });

      describe('update: PUT /api/job/:id/status with status=error', function () {
        it('should answer 200 OK', function (done) {
          request(app)
            .put('/api/job/' + jobId + '/status')
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .send({
              "status": "error"
            })
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              if (err) return done(err);
              kue.Job.get(jobId, function (err, job) {
                assert(job.state() === 'failed');
                // after a short time, job should be active again.
                setTimeout(function () {
                  kue.Job.get(jobId, function (err, job) {
                    console.log('JOB STATE = '+job.state());
                    assert(job.state() === 'delayed'); // because of the backoff
                    done(err);
                  });
                }, 200);
              });
            });
        });

        it('should have changed the job status to delayed (because of 1s backoff)', function (done) {
          request(app)
            .get('/api/job/' + jobId)
            .set("Authorization", authorization)
            .set("Content-Type", "application/json")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
              assert(res.body.id === String(jobId));
              assert(res.body.type === 'pack captions');
              assert(res.body.state === 'delayed');
              done(err);
            });
        });

        it('should have changed the job status to active after 1s', function (done) {
          setTimeout(function () {
            request(app)
              .get('/api/job/' + jobId)
              .set("Authorization", authorization)
              .set("Content-Type", "application/json")
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200, function (err, res) {
                assert(res.body.id === String(jobId));
                assert(res.body.type === 'pack captions');
                assert(res.body.state === 'active');
                done(err);
              });
          }, 1100);
        });
      });
    });
  });
});