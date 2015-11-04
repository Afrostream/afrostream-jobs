'use strict';

process.env.NO_ASSERT = true; // enforce.

module.exports = {
  redisUrl: process.env.REDIS_URL,
  app: {
    middlewareAuth: true,
    middlewareAuthToken: process.env.AUTH_TOKEN,
    middlewareEnsureHttps: false
  }
};