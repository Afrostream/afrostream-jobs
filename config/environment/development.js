'use strict';

module.exports = {
  redisUrl: undefined, // default configuration (local redis server)
  app: {
    basicAuth: {user: 'dev', password: 'dev'},
    middlewareEnsureHttps: false
  }
};