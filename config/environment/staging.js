'use strict';

module.exports = {
  redisUrl: process.env.REDIS_URL,
  app: {
    middlewareAuth: true,
    middlewareAuthToken: process.env.AUTH_TOKEN
  }
};