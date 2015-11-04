'use strict';

var express = require('express')
  , app = express();

var basicAuth = require('basic-auth-connect');

var config = require('../config');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.send();
  } else {
    next();
  }
});

// assuming we will use https only.
app.use(basicAuth(config.app.basicAuth.user, config.app.basicAuth.password));

if (config.app.middlewareEnsureHttps) {
  app.use(function httpsOnly(req, res, next) {
    if (req.get('X-Forwarded-Proto') !== 'https') {
      console.error(req.url + ' was denied (non https)');
      res.status(401).send('');
    }
  });
}

module.exports = app;