const memberService = require('../services/memberService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/sendResponse');

const createMember = asyncHandler(async (req, res) => {
  const member = await memberService.createMember(req.body);
  sendResponse(res, 201, 'Member created successfully', member);
});

const listMembers = asyncHandler(async (req, res) => {
  const result = await memberService.listMembers(req.query);
  sendResponse(res, 200, 'Members fetched successfully', result.items, result.meta);
});

const getMemberById = asyncHandler(async (req, res) => {
  const member = await memberService.getMemberById(req.params.id);
  sendResponse(res, 200, 'Member fetched successfully', member);
});

const updateMember = asyncHandler(async (req, res) => {
  const member = await memberService.updateMember(req.params.id, req.body);
  sendResponse(res, 200, 'Member updated successfully', member);
});

const deleteMember = asyncHandler(async (req, res) => {
  await memberService.deleteMember(req.params.id);
  sendResponse(res, 200, 'Member deleted successfully');
});

module.exports = {
  createMember,
  listMembers,
  getMemberById,
  updateMember,
  deleteMember,
};
