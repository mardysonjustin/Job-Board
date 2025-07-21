const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

router.post('/', upload.single('resume'), (req, res) => {
  const jobDescription = req.body.job_description;
  const resumeFile = req.file;

  if (!jobDescription || !resumeFile) {
    return res.status(400).json({ error: 'Missing job description or resume file.' });
  }

  // dummy response for now
  res.json({
    score: 85,
    matched_skills: ['JavaScript', 'Node.js'],
    missing_skills: ['Python']
  });
});

module.exports = router;
