const express = require('express');
const cors = require('cors');
const matchRoutes = require('./routes/match');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/match', matchRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('AI Resume Matcher API is running.');
});
