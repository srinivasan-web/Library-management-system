const Member = require('../models/Member');
const { escapeRegex } = require('../utils/escapeRegex');

function buildMemberFilter(filters = {}) {
  const filter = {};

  if (filters.search) {
    const searchRegex = new RegExp(escapeRegex(filters.search), 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { membershipId: searchRegex },
      { phone: searchRegex },
    ];
  }

  if (filters.status) {
    filter.status = filters.status;
  }

  return filter;
}

async function createMember(data, options = {}) {
  const [member] = await Member.create([data], { session: options.session });
  return member;
}

function findById(id, options = {}) {
  const query = Member.findById(id);

  if (options.session) {
    query.session(options.session);
  }

  return query;
}

function findByEmail(email) {
  return Member.findOne({ email: email.toLowerCase() });
}

function findByMembershipId(membershipId) {
  return Member.findOne({ membershipId: membershipId.toUpperCase() });
}

async function listMembers(filters, pagination) {
  const filter = buildMemberFilter(filters);
  const [items, total] = await Promise.all([
    Member.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Member.countDocuments(filter),
  ]);

  return {
    items,
    total,
  };
}

function updateById(id, data, options = {}) {
  return Member.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
    session: options.session,
  });
}

function deleteById(id) {
  return Member.findByIdAndDelete(id);
}

module.exports = {
  createMember,
  findById,
  findByEmail,
  findByMembershipId,
  listMembers,
  updateById,
  deleteById,
};
