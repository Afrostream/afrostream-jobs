'use strict';

module.exports = {
  redisUrl: undefined, // default configuration (local redis server)
  app: {
    middlewareAuth: false,
    middlewareAuthToken: 'dev'
  }
};