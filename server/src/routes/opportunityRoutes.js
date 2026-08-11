const express = require('express');
const {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
  approveOpportunity,
  rejectOpportunity,
  getMyOpportunities,
} = require('../controllers/opportunityController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All opportunity routes require login
router.use(protect);

router.get('/', getOpportunities);
router.get('/my', restrictTo('investor', 'admin'), getMyOpportunities);
router.get('/:id', getOpportunity);

// Admin or Investor can create (controller enforces type rules)
router.post('/', restrictTo('admin', 'investor'), createOpportunity);

// Admin only
router.patch('/:id/approve', restrictTo('admin'), approveOpportunity);
router.patch('/:id/reject', restrictTo('admin'), rejectOpportunity);
router.put('/:id', restrictTo('admin'), updateOpportunity);
router.delete('/:id', restrictTo('admin'), deleteOpportunity);

module.exports = router;