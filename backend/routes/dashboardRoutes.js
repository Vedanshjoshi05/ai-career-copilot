const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getDashboard } = require('../controllers/mainControllers');
router.get('/', protect, getDashboard);
module.exports = router;
