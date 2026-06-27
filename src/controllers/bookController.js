const bookService = require('../services/bookService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/sendResponse');

const createBook = asyncHandler(async (req, res) => {
  const book = await bookService.createBook(req.body);
  sendResponse(res, 201, 'Book created successfully', book);
});

const listBooks = asyncHandler(async (req, res) => {
  const result = await bookService.listBooks(req.query);
  sendResponse(res, 200, 'Books fetched successfully', result.items, result.meta);
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);
  sendResponse(res, 200, 'Book fetched successfully', book);
});

const updateBook = asyncHandler(async (req, res) => {
  const book = await bookService.updateBook(req.params.id, req.body);
  sendResponse(res, 200, 'Book updated successfully', book);
});

const deleteBook = asyncHandler(async (req, res) => {
  await bookService.deleteBook(req.params.id);
  sendResponse(res, 200, 'Book deleted successfully');
});

module.exports = {
  createBook,
  listBooks,
  getBookById,
  updateBook,
  deleteBook,
};
