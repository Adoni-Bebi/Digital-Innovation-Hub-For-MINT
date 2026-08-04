const express = require('express');
const {
  createStartup,
  getMyStartup,
  updateMyStartup,
  getVerifiedStartups,
  getStartup,
  getPendingStartups,
  approveStartup,
  rejectStartup,
  getAdminStats,
  getPublicStats,
  getAdminStartups,
} = require('../controllers/startupController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.get('/', getVerifiedStartups);
router.get('/public-stats', getPublicStats);

// Protected
router.use(protect);

router.post('/', restrictTo('founder'), createStartup);
router.get('/my', restrictTo('founder'), getMyStartup);
router.put('/my', restrictTo('founder'), updateMyStartup);

router.get('/pending', restrictTo('admin'), getPendingStartups);
router.get('/stats', restrictTo('admin'), getAdminStats);
router.get('/admin', restrictTo('admin'), getAdminStartups);

router.patch('/:id/approve', restrictTo('admin'), approveStartup);
router.patch('/:id/reject', restrictTo('admin'), rejectStartup);

router.get('/:id', getStartup);

module.exports = router;