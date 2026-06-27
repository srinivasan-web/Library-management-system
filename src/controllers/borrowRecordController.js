const borrowRecordService = require('../services/borrowRecordService');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/sendResponse');

const borrowBook = asyncHandler(async (req, res) => {
  const record = await borrowRecordService.borrowBook(req.body, req.user);
  sendResponse(res, 201, 'Book borrowed successfully', record);
});

const returnBook = asyncHandler(async (req, res) => {
  const record = await borrowRecordService.returnBook(req.params.id, req.body, req.user);
  sendResponse(res, 200, 'Book returned successfully', record);
});

const listBorrowRecords = asyncHandler(async (req, res) => {
  const result = await borrowRecordService.listBorrowRecords(req.query);
  sendResponse(res, 200, 'Borrow records fetched successfully', result.items, result.meta);
});

const getBorrowRecordById = asyncHandler(async (req, res) => {
  const record = await borrowRecordService.getBorrowRecordById(req.params.id);
  sendResponse(res, 200, 'Borrow record fetched successfully', record);
});

module.exports = {
  borrowBook,
  returnBook,
  listBorrowRecords,
  getBorrowRecordById,
};
