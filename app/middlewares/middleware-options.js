'use strict';

module.exports = function (options) {
  return function (req, res, next) {
    if (req.method === 'OPTIONS') {
      res.send();
    } else {
      next();
    }
  };
};