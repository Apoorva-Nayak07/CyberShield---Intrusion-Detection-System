const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', alertController.getAlerts);
router.put('/mark-all-read', alertController.markAllRead);
router.get('/:id', alertController.getAlert);
router.put('/:id/acknowledge', authorize('admin', 'analyst'), alertController.acknowledgeAlert);
router.put('/:id/resolve', authorize('admin', 'analyst'), alertController.resolveAlert);
router.post('/:id/notes', authorize('admin', 'analyst'), alertController.addNote);
router.put('/:id/assign', authorize('admin', 'analyst'), alertController.assignAlert);
router.delete('/:id', authorize('admin'), alertController.deleteAlert);

module.exports = router;
