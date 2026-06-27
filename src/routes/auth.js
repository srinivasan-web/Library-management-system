const router = require('express').Router();
const authController = require('../controllers/authController');
const { registerValidators, loginValidators } = require('../validators/authValidators');
const { validateRequest } = require('../middleware/validateRequest');

router.post('/register', registerValidators, validateRequest, authController.register);
router.post('/login', loginValidators, validateRequest, authController.login);

module.exports = router;
