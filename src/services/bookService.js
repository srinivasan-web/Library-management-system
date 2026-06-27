const bookRepository = require('../repositories/bookRepository');
const borrowRecordRepository = require('../repositories/borrowRecordRepository');
const { ApiError } = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

async function ensureIsbnAvailable(isbn, currentBookId = null) {
  if (!isbn) {
    return;
  }

  const existingBook = await bookRepository.findByIsbn(isbn);

  if (existingBook && existingBook.id !== currentBookId) {
    throw new ApiError(409, 'ISBN is already assigned to another book', 'ISBN_ALREADY_EXISTS');
  }
}

async function createBook(data) {
  await ensureIsbnAvailable(data.isbn);

  const totalCopies = Number(data.totalCopies);
  const availableCopies = data.availableCopies === undefined
    ? totalCopies
    : Number(data.availableCopies);

  if (availableCopies > totalCopies) {
    throw new ApiError(400, 'Available copies cannot exceed total copies', 'INVALID_COPY_COUNT');
  }

  return bookRepository.createBook({
    ...data,
    totalCopies,
    availableCopies,
  });
}

async function listBooks(query) {
  const pagination = getPagination(query);
  const result = await bookRepository.listBooks(query, pagination);

  return {
    items: result.items,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.total),
  };
}

async function getBookById(id) {
  const book = await bookRepository.findById(id);

  if (!book) {
    throw new ApiError(404, 'Book was not found', 'BOOK_NOT_FOUND');
  }

  return book;
}

async function updateBook(id, data) {
  const book = await getBookById(id);

  await ensureIsbnAvailable(data.isbn, book.id);

  const activeBorrowCount = await borrowRecordRepository.countActiveByBook(id);
  const nextTotalCopies = data.totalCopies === undefined ? book.totalCopies : Number(data.totalCopies);
  const nextAvailableCopies = data.availableCopies === undefined
    ? book.availableCopies + (nextTotalCopies - book.totalCopies)
    : Number(data.availableCopies);

  if (nextTotalCopies < activeBorrowCount) {
    throw new ApiError(
      409,
      'Total copies cannot be less than the number of active borrow records',
      'TOTAL_COPIES_BELOW_ACTIVE_BORROWS'
    );
  }

  if (nextAvailableCopies < 0 || nextAvailableCopies > nextTotalCopies - activeBorrowCount) {
    throw new ApiError(
      400,
      'Available copies must fit current active borrow count',
      'INVALID_AVAILABLE_COPIES'
    );
  }

  return bookRepository.updateById(id, {
    ...data,
    totalCopies: nextTotalCopies,
    availableCopies: nextAvailableCopies,
  });
}

async function deleteBook(id) {
  await getBookById(id);

  const activeBorrowCount = await borrowRecordRepository.countActiveByBook(id);

  if (activeBorrowCount > 0) {
    throw new ApiError(409, 'Book cannot be deleted while copies are borrowed', 'BOOK_HAS_ACTIVE_BORROWS');
  }

  return bookRepository.deleteById(id);
}

module.exports = {
  createBook,
  listBooks,
  getBookById,
  updateBook,
  deleteBook,
};
