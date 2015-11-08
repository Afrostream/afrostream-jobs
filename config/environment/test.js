'use strict';

module.exports = {
  redis: {
    prefix: 'kue',
    redis: undefined // default configuration (local redis server)
  },
  app: {
    basicAuth: {user: 'test', password: 'test'},
    middlewareEnsureHttps: false,
    middlewareDumpPostData: false
  },
  env: 'test'
};