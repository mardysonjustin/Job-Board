const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

router.post('/', upload.single('resume'), async (req, res) => {
  const jobDescription = req.body.job_description;
  const resumeFile = req.file;

  if (!jobDescription || !resumeFile) {
    return res.status(400).json({ error: 'Missing job description or resume file.' });
  }

  console.log(`📄 Processing resume: ${resumeFile.originalname}`);

  try {
    // prep data to send to ML API
    const form = new FormData();
    form.append('job_description', jobDescription);
    form.append('resume', fs.createReadStream(resumeFile.path), resumeFile.originalname);

    const response = await axios.post('http://127.0.0.1:5000/match', form, {
      headers: form.getHeaders()
    });

    if (!response.data || typeof response.data.score === 'undefined') {
      throw new Error('ML API response missing expected fields');
    }

    console.log('✔️ Score retrieved from ML API:', response.data.score + '%');
    res.json(response.data);

  } catch (error) {
    console.error('Error forwarding to ML API:', error.message);

    if (error.response) {
      console.error('STATUS:', error.response.status);
      console.error('DATA:', error.response.data);
      res.status(500).json({ error: error.response.data?.error || 'ML API error' });
    } else if (error.request) {
      console.error('NO RESPONSE RECEIVED FROM ML API');
      res.status(500).json({ error: 'No response from ML API.' });
    } else {
      console.error('UNEXPECTED ERROR:', error.message);
      res.status(500).json({ error: 'Unexpected error forwarding to ML API.' });
    }

  } finally {
    fs.unlink(resumeFile.path, () => {});
  }
});

module.exports = router;
