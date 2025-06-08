console.log("Starting server...");

const ADMIN_PASSWORD = 'yourStrongPassword123'; // Change this to your own secure password

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// File path for logging
const logFilePath = path.join(__dirname, 'locations.txt');

// Route to log location data
app.post('/log-location', (req, res) => {
  const { name, latitude, longitude } = req.body;

  if (name && latitude && longitude) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Name: ${name}, Latitude: ${latitude}, Longitude: ${longitude}\n`;

    // ✅ Log to console with Google Maps link
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    console.log(`📍 New location logged for ${name}: ${mapsLink}`);

    // Write to locations.txt
    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        return res.status(500).send('Failed to log location.');
      }
      res.status(200).send('Location and name logged!');
    });
  } else {
    res.status(400).send('Invalid data.');
  }
});

// Admin route to read logs
app.post('/admin/logs', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).send('Unauthorized');
  }

  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading log file:', err);
      return res.status(500).send('Could not read logs.');
    }
    res.status(200).send(data);
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
