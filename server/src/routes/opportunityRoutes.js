const express = require('express');
const {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All opportunity routes require login
router.use(protect);

router.get('/', getOpportunities);
router.get('/:id', getOpportunity);

router.post('/', restrictTo('admin'), createOpportunity);
router.put('/:id', restrictTo('admin'), updateOpportunity);
router.delete('/:id', restrictTo('admin'), deleteOpportunity);

module.exports = router;