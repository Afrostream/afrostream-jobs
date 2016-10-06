'use strict';

var request = require('request');

var Q = require('q');

var config = require('../config');

/**
 * This job will wait for pfContentId to be ready.
 *
 * INPUT job.data =
 * {
 *   "xml": "http://blabla.com/foo/bar/niania",
 *   "pfContentId": "1316",
 *   "captions": [ "http://file1", "http://file2", ... ]
 * }
 *
 * BACKEND API:
 * curl -X POST -d '{
 *   "sharedSecret": "62b8557f248035275f6f8219fed7e9703d59509c"
 *   "xml": "http://blabla.com/foo/bar/niania",
 *   "pfContentId": "1316",
 *   "captions": [ "http://file1", "http://file2", ... ]
 * }' https://legacy-api.afrostream.tv/api/catchup/bet
 */
module.exports = function (job, ctx, done) {
  var log = function () {
    console.log.apply(console, arguments);
    job.log.apply(job, arguments);
  };

  // logs.
  log('JOB: catchup-bet: start');
  log('JOB: catchup-bet: input job.data', JSON.stringify(job.data));

  // ensure backend-data is meaning full.
  if (!job.data || !job.data.xml || !job.data.pfContentId) {
    return done(new Error('malformed input'));
  }

  //
  var backendUri = config['afrostream-backend'].scheme + '://' + config['afrostream-backend'].authority + '/api/catchup/bet';
  log('JOB: catchup-bet: requesting ' + backendUri);

  var body = {
    sharedSecret: "62b8557f248035275f6f8219fed7e9703d59509c",
    xml: job.data.xml,
    pfContentId: job.data.pfContentId,
    captions: job.data.captions || []
  };
  log('JOB: catchup-bet: requesting body = ' + JSON.stringify(body));

  Q.nfcall(request, {
    method: 'POST',
    uri: backendUri,
    body: body,
    json: true
  }).then(function (result) {
    var response = result[0], body = result[1];

    if (response.statusCode !== 200) {
      throw "status="+response.statusCode+", body="+JSON.stringify(body);
    }
    log('JOB: catchup-bet: backend result = ' + JSON.stringify(body));
  }).then(
    function success() {
      console.log('JOB: catchup-bet: success');
      done(null, 'success');
    },
    function error(err) {
      console.error('JOB: catchup-bet: error ' + err, err);
      done(err);
    }
  );
};
