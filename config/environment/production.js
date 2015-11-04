'use strict';

process.env.NO_ASSERT = true; // enforce.

module.exports = {
  redisUrl: process.env.REDIS_URL,
  app: {
    basicAuth: {user: 'afrostream', password: 'r4nd0mT0k3n'},
    middlewareEnsureHttps: false
  }
};