'use strict';

module.exports = {
  redis: {
    prefix: 'kue',
    redis: process.env.REDIS_URL
  },
  app: {
    basicAuth: {user: 'afrostream', password: 'r4nd0mT0k3n'},
    middlewareEnsureHttps: false
  }
};