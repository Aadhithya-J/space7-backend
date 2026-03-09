const { Router } = require('express');
const spaceController = require('../controllers/spaceController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { createSpaceSchema, joinSpaceSchema } = require('../validators/spaceValidator');

const router = Router();

// Public discovery
router.get('/trending', spaceController.trending);
router.get('/search', spaceController.search);
router.get('/tag/:tag', spaceController.searchByTag);

// Authenticated routes
router.use(authMiddleware);

router.post('/', validate(createSpaceSchema), spaceController.create);
router.get('/recommended', spaceController.recommended);
router.get('/my', spaceController.mySpaces);
router.get('/:id', spaceController.getById);
router.post('/:id/join', validate(joinSpaceSchema), spaceController.join);
router.post('/:id/invite', spaceController.generateInvite);
router.get('/:id/invite-codes', spaceController.listInviteCodes);
router.delete('/:id/members/:userId', spaceController.removeMember);
router.put('/:id/lock', spaceController.toggleLock);
router.put('/:id/archive', spaceController.archive);

module.exports = router;
