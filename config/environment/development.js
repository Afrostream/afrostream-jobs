'use strict';

module.exports = {
  redis: {
    prefix: 'kue',
    redis: undefined // default configuration (local redis server)
  },
  app: {
    basicAuth: {user: 'dev', password: 'dev'},
    middlewareEnsureHttps: false,
    middlewareDumpPostData: true
  },
  "afrostream-backend": {
    scheme: "http",
    authority: "localhost:9000"
  }
};