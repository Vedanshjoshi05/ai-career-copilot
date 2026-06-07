const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { uploadResume, getResumes, getResume, deleteResume, tailorResume } = require('../controllers/resumeController');

router.use(protect);
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);
router.post('/tailor', tailorResume);

module.exports = router;
