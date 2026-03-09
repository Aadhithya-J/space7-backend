const { Router } = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { sendMessageSchema } = require('../validators/messageValidator');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

const router = Router();

router.use(authMiddleware);

router.post('/:spaceId', upload.single('media'), validate(sendMessageSchema), messageController.send);
router.get('/:spaceId', messageController.list);
router.post('/:spaceId/:messageId/appreciate', messageController.appreciate);
router.delete('/:spaceId/:messageId', messageController.remove);

module.exports = router;
