'use strict';

var request = require('request');

var Q = require('q');

/**
 * INPUT job.data =
 *
 * {
 *   videoId: 'e6dbfd66-56e0-435c-91df-cab9c5a67485',
 *   encodingId: 'b829352c949f8bfc',
 *   captions: [
 *     { src: 'http://foo.bar', lang: '' },
 *     { src: 'http://foo.bar', lang: '' }
 *   ]
 * }
 *
 * VIDEO PLATFORM API:
 * curl -X POST -d '{
 *   "sharedSecret": "12322bbc4e7a9d4fe2cf58c57b67f8f6",
 *   "encodingId": "d4eed726882a4be3",
 *   "subtitles": [
 *     { "lang": "fre", "url": "https://s3-eu-west-1.amazonaws.com/tracks.afrostream.tv/production/caption/2015/09/6f287a7f284ea2f4c9c7-vimeocom138655523.fr.vtt" },
 *     { "lang": "eng", "url": "https://s3-eu-west-1.amazonaws.com/tracks.afrostream.tv/production/caption/2015/09/6bae0f56828f350758b6-vimeocom138655523.en.vtt" }
 *   ]
 * }' http://p-afsmsch-001.afrostream.tv/api/setSubtitles
 */
module.exports = function (job, ctx, done) {
  // logs.
  console.log('JOB: pack captions: start');
  console.log('JOB: pack captions: input job.data', JSON.stringify(job.data));

  // no dev / test / staging env yet on video platform.
  if (process.env.NODE_ENV !== 'production') {
    return done(null, 'success');
  }

  // ensure backend-data is meaning full.
  if (!job.data || !job.data.encodingId || !Array.isArray(job.data.captions)) {
    return done(new Error('malformed input'));
  }

  if (job.data.captions.length === 0) {
    return done(new Error('no captions'));
  }

  //
  console.log('JOB: pack captions: requesting p-afsmsch-001.afrostream.tv/api/setSubtitles');
  Q.nfcall(request, {
    method: 'POST',
    uri: 'http://p-afsmsch-001.afrostream.tv/api/setSubtitles', // FIXME: conf
    body: {
      sharedSecret: "12322bbc4e7a9d4fe2cf58c57b67f8f6",
      encodingId: job.data.encodingId,
      subtitles: job.data.captions.map(function (caption) {
        return {
          lang: caption.lang,
          url: caption.src
        };
      })
    },
    json: true
  }).then(function (result) {
    var response = result[0], body = result[1];
    if (response.statusCode !== 200) {
      throw "status="+response.statusCode+", body="+body;
    }
    console.log('JOB: pack captions: video platform result = ' + body);
  }).then(
    function success() {
      console.log('JOB: pack captions: success');
      done(null, 'success');
    },
    function error(err) {
      console.error('JOB: pack captions: error', err);
      done(err);
    }
  );
};