const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { generateRoadmap, getRoadmaps, updateRoadmapProgress } = require('../controllers/mainControllers');
router.use(protect);
router.post('/generate', generateRoadmap);
router.get('/', getRoadmaps);
router.put('/:id/progress', updateRoadmapProgress);
module.exports = router;
