const router = require('express').Router();
const bookController = require('../controllers/bookController');
const { USER_ROLES } = require('../constants/roles');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateRequest } = require('../middleware/validateRequest');
const { objectIdParam } = require('../validators/commonValidators');
const {
  createBookValidators,
  updateBookValidators,
  listBookValidators,
} = require('../validators/bookValidators');

router.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN));

router.post('/', createBookValidators, validateRequest, bookController.createBook);
router.get('/', listBookValidators, validateRequest, bookController.listBooks);
router.get('/:id', objectIdParam('id'), validateRequest, bookController.getBookById);
router.patch('/:id', updateBookValidators, validateRequest, bookController.updateBook);
router.delete('/:id', objectIdParam('id'), validateRequest, bookController.deleteBook);

module.exports = router;
