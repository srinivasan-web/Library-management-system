const User = require('../models/User');

async function createUser(data, options = {}) {
  const [user] = await User.create([data], { session: options.session });
  return user;
}

function findByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

function findByEmailWithPassword(email) {
  return User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
}

function findById(id, options = {}) {
  const query = User.findById(id);

  if (options.select) {
    query.select(options.select);
  }

  if (options.session) {
    query.session(options.session);
  }

  return query;
}

module.exports = {
  createUser,
  findByEmail,
  findByEmailWithPassword,
  findById,
};
