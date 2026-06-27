const userRepository = require('../repositories/userRepository');
const { ApiError } = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken } = require('../utils/jwt');

function buildAuthPayload(user) {
  return {
    user: user.toJSON(),
    accessToken: signAccessToken(user),
  };
}

async function register(data) {
  const existingUser = await userRepository.findByEmail(data.email);

  if (existingUser) {
    throw new ApiError(409, 'Email is already registered', 'EMAIL_ALREADY_REGISTERED');
  }

  const passwordHash = await hashPassword(data.password);
  const user = await userRepository.createUser({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  return buildAuthPayload(user);
}

async function login(data) {
  const user = await userRepository.findByEmailWithPassword(data.email);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This user account is inactive', 'USER_INACTIVE');
  }

  const passwordMatches = await comparePassword(data.password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  return buildAuthPayload(user);
}

module.exports = {
  register,
  login,
};
