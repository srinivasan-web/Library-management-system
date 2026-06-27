const BorrowRecord = require('../models/BorrowRecord');
const { BORROW_STATUS } = require('../constants/borrowStatus');

function buildBorrowRecordFilter(filters = {}) {
  const filter = {};

  if (filters.status) {
    filter.status = filters.status;
  }

  if (filters.memberId) {
    filter.member = filters.memberId;
  }

  if (filters.bookId) {
    filter.book = filters.bookId;
  }

  return filter;
}

async function createBorrowRecord(data, options = {}) {
  const [record] = await BorrowRecord.create([data], { session: options.session });
  return record;
}

function findById(id, options = {}) {
  const query = BorrowRecord.findById(id);

  if (options.session) {
    query.session(options.session);
  }

  return query;
}

function findDetailedById(id, options = {}) {
  const query = BorrowRecord.findById(id)
    .populate('book', 'title author isbn')
    .populate('member', 'name email membershipId')
    .populate('borrowedBy', 'name email role')
    .populate('returnedBy', 'name email role');

  if (options.session) {
    query.session(options.session);
  }

  return query;
}

function findActiveByMemberAndBook(memberId, bookId, options = {}) {
  const query = BorrowRecord.findOne({
    member: memberId,
    book: bookId,
    status: BORROW_STATUS.ACTIVE,
  });

  if (options.session) {
    query.session(options.session);
  }

  return query;
}

function countActiveByMember(memberId, options = {}) {
  const query = BorrowRecord.countDocuments({
    member: memberId,
    status: BORROW_STATUS.ACTIVE,
  });

  if (options.session) {
    query.session(options.session);
  }

  return query;
}

function countActiveByBook(bookId, options = {}) {
  const query = BorrowRecord.countDocuments({
    book: bookId,
    status: BORROW_STATUS.ACTIVE,
  });

  if (options.session) {
    query.session(options.session);
  }

  return query;
}

async function listBorrowRecords(filters, pagination) {
  const filter = buildBorrowRecordFilter(filters);
  const [items, total] = await Promise.all([
    BorrowRecord.find(filter)
      .populate('book', 'title author isbn')
      .populate('member', 'name email membershipId')
      .populate('borrowedBy', 'name email role')
      .populate('returnedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    BorrowRecord.countDocuments(filter),
  ]);

  return {
    items,
    total,
  };
}

function markReturned(id, data, options = {}) {
  return BorrowRecord.findOneAndUpdate(
    {
      _id: id,
      status: BORROW_STATUS.ACTIVE,
    },
    {
      $set: {
        returnedBy: data.returnedBy,
        returnedAt: data.returnedAt,
        fineAmount: data.fineAmount,
        status: BORROW_STATUS.RETURNED,
        notes: data.notes,
      },
    },
    {
      new: true,
      runValidators: true,
      session: options.session,
    }
  );
}

module.exports = {
  createBorrowRecord,
  findById,
  findDetailedById,
  findActiveByMemberAndBook,
  countActiveByMember,
  countActiveByBook,
  listBorrowRecords,
  markReturned,
};
