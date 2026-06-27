const memberRepository = require('../repositories/memberRepository');
const borrowRecordRepository = require('../repositories/borrowRecordRepository');
const { ApiError } = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

async function ensureEmailAvailable(email, currentMemberId = null) {
  if (!email) {
    return;
  }

  const existingMember = await memberRepository.findByEmail(email);

  if (existingMember && existingMember.id !== currentMemberId) {
    throw new ApiError(409, 'Email is already assigned to another member', 'MEMBER_EMAIL_EXISTS');
  }
}

async function ensureMembershipIdAvailable(membershipId, currentMemberId = null) {
  if (!membershipId) {
    return;
  }

  const existingMember = await memberRepository.findByMembershipId(membershipId);

  if (existingMember && existingMember.id !== currentMemberId) {
    throw new ApiError(
      409,
      'Membership ID is already assigned to another member',
      'MEMBERSHIP_ID_EXISTS'
    );
  }
}

async function createMember(data) {
  await ensureEmailAvailable(data.email);
  await ensureMembershipIdAvailable(data.membershipId);

  return memberRepository.createMember(data);
}

async function listMembers(query) {
  const pagination = getPagination(query);
  const result = await memberRepository.listMembers(query, pagination);

  return {
    items: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total),
  };
}

async function getMemberById(id) {
  const member = await memberRepository.findById(id);

  if (!member) {
    throw new ApiError(404, 'Member was not found', 'MEMBER_NOT_FOUND');
  }

  return member;
}

async function updateMember(id, data) {
  const member = await getMemberById(id);

  await ensureEmailAvailable(data.email, member.id);
  await ensureMembershipIdAvailable(data.membershipId, member.id);

  return memberRepository.updateById(id, data);
}

async function deleteMember(id) {
  await getMemberById(id);

  const activeBorrowCount = await borrowRecordRepository.countActiveByMember(id);

  if (activeBorrowCount > 0) {
    throw new ApiError(409, 'Member cannot be deleted with active borrow records', 'MEMBER_HAS_ACTIVE_BORROWS');
  }

  return memberRepository.deleteById(id);
}

module.exports = {
  createMember,
  listMembers,
  getMemberById,
  updateMember,
  deleteMember,
};
