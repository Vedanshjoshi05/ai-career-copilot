const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { getAdminStats, getAllUsers } = require('../controllers/mainControllers');
router.use(protect, adminOnly);
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
module.exports = router;
