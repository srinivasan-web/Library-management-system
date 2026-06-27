const { ApiError } = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route ${req.originalUrl} was not found`, 'ROUTE_NOT_FOUND'));
}

module.exports = {
  notFoundHandler,
};
