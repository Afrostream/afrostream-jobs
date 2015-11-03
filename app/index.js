'use strict';

var express = require('express')
  , app = express();

var config = require('../config');

if (config.app.middlewareAuth) {
  // authentication by header...
  // assuming we will use https only.
  app.use(function auth(req, res, next) {
    if (req.get('token') !== config.app.middlewareAuthToken) {
      console.error(req.url + ' was denied (missing token)');
      res.status(401).send('');
    } else {
      next();
    }
  });

  app.use(function httpsOnly(req, res, next) {
    if (req.get('X-Forwarded-Proto') !== 'https') {
      console.error(req.url + ' was denied (non https)');
      res.status(401).send('');
    }
  });
}

module.exports = app;