const express = require('express');
const router = express.Router();
const threatController = require('../controllers/threatController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', threatController.getThreatStats);
router.get('/', threatController.getThreats);
router.get('/:id', threatController.getThreat);
router.post('/', authorize('admin', 'analyst'), threatController.createThreat);
router.put('/:id', authorize('admin', 'analyst'), threatController.updateThreat);
router.put('/:id/resolve', authorize('admin', 'analyst'), threatController.resolveThreat);
router.post('/:id/notes', authorize('admin', 'analyst'), threatController.addNote);
router.delete('/:id', authorize('admin'), threatController.deleteThreat);

module.exports = router;
