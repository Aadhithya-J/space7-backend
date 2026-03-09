const { Router } = require('express');
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// Public
router.get('/search', authMiddleware, profileController.searchUsers);
router.get('/user/:userId', authMiddleware, profileController.getPublicProfile);

// Authenticated
router.use(authMiddleware);

router.get('/me', profileController.getProfile);
router.put('/username', profileController.updateUsername);
router.put('/bio', profileController.updateBio);
router.put('/picture', upload.single('avatar'), profileController.updateProfilePicture);
router.put('/password', profileController.changePassword);
router.delete('/account', profileController.deleteAccount);

module.exports = router;
