const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validationMiddleware');
const {
    signupSchema,
    verifyOtpSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} = require('../validators/authValidator');

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOTP);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
