const bookRepository = require('../repositories/bookRepository');
const memberRepository = require('../repositories/memberRepository');
const borrowRecordRepository = require('../repositories/borrowRecordRepository');
const { BOOK_STATUS } = require('../constants/bookStatus');
const { MEMBER_STATUS } = require('../constants/memberStatus');
const { BORROW_STATUS } = require('../constants/borrowStatus');
const { ApiError } = require('../utils/ApiError');
const { config } = require('../config/env');
const { getPagination, getPaginationMeta } = require('../utils/pagination');
const { runInTransaction } = require('../utils/runInTransaction');

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function calculateFine(dueDate, returnedAt) {
  const lateMilliseconds = returnedAt.getTime() - dueDate.getTime();

  if (lateMilliseconds <= 0) {
    return 0;
  }

  const daysLate = Math.ceil(lateMilliseconds / MILLISECONDS_PER_DAY);
  return daysLate * config.dailyFineRate;
}

function ensureFutureDueDate(dueDate) {
  if (Number.isNaN(dueDate.getTime()) || dueDate <= new Date()) {
    throw new ApiError(400, 'Due date must be a valid future date', 'INVALID_DUE_DATE');
  }
}

async function borrowBook(data, actor) {
  const dueDate = new Date(data.dueDate);
  ensureFutureDueDate(dueDate);

  const record = await runInTransaction(async (session) => {
    const book = await bookRepository.findById(data.bookId, { session });
    const member = await memberRepository.findById(data.memberId, { session });

    if (!book || book.status !== BOOK_STATUS.ACTIVE) {
      throw new ApiError(404, 'Active book was not found', 'BOOK_NOT_AVAILABLE');
    }

    if (!member) {
      throw new ApiError(404, 'Member was not found', 'MEMBER_NOT_FOUND');
    }

    if (member.status !== MEMBER_STATUS.ACTIVE) {
      throw new ApiError(409, 'Only active members can borrow books', 'MEMBER_NOT_ACTIVE');
    }

    const activeBorrowCount = await borrowRecordRepository.countActiveByMember(member.id, { session });
    const existingActiveRecord = await borrowRecordRepository.findActiveByMemberAndBook(member.id, book.id, { session });

    if (activeBorrowCount >= member.activeBorrowLimit) {
      throw new ApiError(409, 'Member has reached the active borrow limit', 'BORROW_LIMIT_REACHED');
    }

    if (existingActiveRecord) {
      throw new ApiError(409, 'Member already has an active borrow for this book', 'BOOK_ALREADY_BORROWED');
    }

    const updatedBook = await bookRepository.decrementAvailableCopy(book.id, { session });

    if (!updatedBook) {
      throw new ApiError(409, 'No copies are currently available', 'BOOK_OUT_OF_STOCK');
    }

    return borrowRecordRepository.createBorrowRecord(
      {
        book: book.id,
        member: member.id,
        borrowedBy: actor.id,
        dueDate,
        notes: data.notes,
      },
      { session }
    );
  });

  return borrowRecordRepository.findDetailedById(record.id);
}

async function returnBook(id, data, actor) {
  const returnedAt = new Date();

  const record = await runInTransaction(async (session) => {
    const activeRecord = await borrowRecordRepository.findById(id, { session });

    if (!activeRecord) {
      throw new ApiError(404, 'Borrow record was not found', 'BORROW_RECORD_NOT_FOUND');
    }

    if (activeRecord.status !== BORROW_STATUS.ACTIVE) {
      throw new ApiError(409, 'Only active borrow records can be returned', 'BORROW_RECORD_NOT_ACTIVE');
    }

    await bookRepository.incrementAvailableCopy(activeRecord.book, { session });

    return borrowRecordRepository.markReturned(
      id,
      {
        returnedBy: actor.id,
        returnedAt,
        fineAmount: calculateFine(activeRecord.dueDate, returnedAt),
        notes: data.notes || activeRecord.notes,
      },
      { session }
    );
  });

  return borrowRecordRepository.findDetailedById(record.id);
}

async function listBorrowRecords(query) {
  const pagination = getPagination(query);
  const result = await borrowRecordRepository.listBorrowRecords(query, pagination);

  return {
    items: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total),
  };
}

async function getBorrowRecordById(id) {
  const record = await borrowRecordRepository.findDetailedById(id);

  if (!record) {
    throw new ApiError(404, 'Borrow record was not found', 'BORROW_RECORD_NOT_FOUND');
  }

  return record;
}

module.exports = {
  borrowBook,
  returnBook,
  listBorrowRecords,
  getBorrowRecordById,
};
