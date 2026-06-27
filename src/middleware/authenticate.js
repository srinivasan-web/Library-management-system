const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/jwt');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token is required', 'AUTH_TOKEN_MISSING');
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  const user = await User.findById(payload.sub).select('_id name email role isActive');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Authenticated user is not active', 'AUTH_USER_INACTIVE');
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  next();
});

module.exports = {
  authenticate,
};
