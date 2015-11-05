'use strict';

module.exports = function (options) {
  return function (req, res, next) {
    if (req.get('X-Forwarded-Proto') !== 'https') {
      console.error(req.url + ' was denied (non https)');
      res.status(401).send('');
    } else {
      next();
    }
  };
};