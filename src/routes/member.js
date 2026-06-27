const router = require('express').Router();
const memberController = require('../controllers/memberController');
const { USER_ROLES } = require('../constants/roles');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateRequest } = require('../middleware/validateRequest');
const { objectIdParam } = require('../validators/commonValidators');
const {
  createMemberValidators,
  updateMemberValidators,
  listMemberValidators,
} = require('../validators/memberValidators');

router.use(authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.LIBRARIAN));

router.post('/', createMemberValidators, validateRequest, memberController.createMember);
router.get('/', listMemberValidators, validateRequest, memberController.listMembers);
router.get('/:id', objectIdParam('id'), validateRequest, memberController.getMemberById);
router.patch('/:id', updateMemberValidators, validateRequest, memberController.updateMember);
router.delete('/:id', objectIdParam('id'), validateRequest, memberController.deleteMember);

module.exports = router;
