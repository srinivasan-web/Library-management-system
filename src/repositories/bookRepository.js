const Book = require('../models/Book');
const { BOOK_STATUS } = require('../constants/bookStatus');
const { escapeRegex } = require('../utils/escapeRegex');

function buildBookFilter(filters = {}) {
  const filter = {};

  if (filters.search) {
    const searchRegex = new RegExp(escapeRegex(filters.search), 'i');
    filter.$or = [
      { title: searchRegex },
      { author: searchRegex },
      { isbn: searchRegex },
      { category: searchRegex },
    ];
  }

  if (filters.category) {
    filter.category = new RegExp(`^${escapeRegex(filters.category)}$`, 'i');
  }

  if (filters.status) {
    filter.status = filters.status;
  }

  return filter;
}

async function createBook(data, options = {}) {
  const [book] = await Book.create([data], { session: options.session });
  return book;
}

function findById(id, options = {}) {
  const query = Book.findById(id);

  if (options.session) {
    query.session(options.session);
  }

  return query;
}

function findByIsbn(isbn) {
  return Book.findOne({ isbn: isbn.toUpperCase() });
}

async function listBooks(filters, pagination) {
  const filter = buildBookFilter(filters);
  const [items, total] = await Promise.all([
    Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Book.countDocuments(filter),
  ]);

  return {
    items,
    total,
  };
}

function updateById(id, data, options = {}) {
  return Book.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
    session: options.session,
  });
}

function deleteById(id) {
  return Book.findByIdAndDelete(id);
}

function decrementAvailableCopy(id, options = {}) {
  return Book.findOneAndUpdate(
    {
      _id: id,
      status: BOOK_STATUS.ACTIVE,
      availableCopies: { $gt: 0 },
    },
    { $inc: { availableCopies: -1 } },
    {
      new: true,
      runValidators: true,
      session: options.session,
    }
  );
}

function incrementAvailableCopy(id, options = {}) {
  return Book.findByIdAndUpdate(
    id,
    { $inc: { availableCopies: 1 } },
    {
      new: true,
      runValidators: true,
      session: options.session,
    }
  );
}

module.exports = {
  createBook,
  findById,
  findByIsbn,
  listBooks,
  updateById,
  deleteById,
  decrementAvailableCopy,
  incrementAvailableCopy,
};
