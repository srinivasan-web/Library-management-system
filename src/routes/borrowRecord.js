const router = require('express').Router();
const borrowRecordController = require('../controllers/borrowRecordController');
const { USER_ROLES } = require('../constants/roles');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateRequest } = require('../middleware/validateRequest');
const { objectIdParam } = require('../validators/commonValidators');
const {
  borrowBookValidators,
  returnBookValidators,
  listBorrowRecordValidators,
} = require('../validators/borrowRecordValidators');

router.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN));

router.post('/borrow', borrowBookValidators, validateRequest, borrowRecordController.borrowBook);
router.get('/', listBorrowRecordValidators, validateRequest, borrowRecordController.listBorrowRecords);
router.get('/:id', objectIdParam('id'), validateRequest, borrowRecordController.getBorrowRecordById);
router.post('/:id/return', returnBookValidators, validateRequest, borrowRecordController.returnBook);

module.exports = router;
