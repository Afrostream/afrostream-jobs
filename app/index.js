'use strict';

var express = require('express')
  , app = express();

var config = require('../config');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, token');
  if (req.method === 'OPTIONS') {
    res.send();
  } else {
    next();
  }
});

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
}

if (config.app.middlewareEnsureHttps) {
  app.use(function httpsOnly(req, res, next) {
    if (req.get('X-Forwarded-Proto') !== 'https') {
      console.error(req.url + ' was denied (non https)');
      res.status(401).send('');
    }
  });
}

module.exports = app;