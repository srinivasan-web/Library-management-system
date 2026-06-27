const authService = require('../services/authService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/sendResponse');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendResponse(res, 201, 'User registered successfully', result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendResponse(res, 200, 'User logged in successfully', result);
});

module.exports = {
  register,
  login,
};
