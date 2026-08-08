const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/', getAllUsers);

module.exports = router;