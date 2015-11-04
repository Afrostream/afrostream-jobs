'use strict';

module.exports = {
  redisUrl: undefined, // default configuration (local redis server)
  app: {
    middlewareAuth: true,
    middlewareAuthToken: 'test',
    middlewareEnsureHttps: false
  },
  env: 'test'
};