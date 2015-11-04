'use strict';

module.exports = {
  redisUrl: undefined, // default configuration (local redis server)
  app: {
    basicAuth: {user: 'test', password: 'test'},
    middlewareEnsureHttps: false
  },
  env: 'test'
};