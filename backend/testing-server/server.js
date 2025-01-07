// server.js (Express Server)
const express = require('express');
const app = express();
const port = 5000;

app.use(express.json()); // To parse JSON data

// API endpoint to receive web vitals data
app.post('/log-web-vitals', (req, res) => {
  console.log('Web Vitals Data:', req.body);
  res.send('Data received');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
