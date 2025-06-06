console.log("Starting server...");
const ADMIN_PASSWORD = 'yourStrongPassword123'; // Change this to your own secure password
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse form POSTs from admin page
app.use(express.static('public'));

const logFilePath = path.join(__dirname, 'locations.txt');

app.post('/log-location', (req, res) => {
  const { name, latitude, longitude } = req.body;

  if (name && latitude && longitude) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Name: ${name}, Latitude: ${latitude}, Longitude: ${longitude}\n`;

    console.log(`Logging location: Name=${name}, Latitude=${latitude}, Longitude=${longitude}`);

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

// New GET route for /admin page with form to enter password and fetch logs
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Admin Logs</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .admin-box {
          background: rgba(0, 0, 0, 0.4);
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 90%;
        }
        h2 {
          margin-bottom: 20px;
          text-align: center;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        input[type="password"] {
          padding: 12px;
          border-radius: 6px;
          border: none;
          font-size: 16px;
        }
        button {
          background-color: #5a4de0;
          border: none;
          padding: 12px;
          font-size: 16px;
          border-radius: 6px;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #4833b4;
        }
        pre {
          background: #222;
          color: #0f0;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          max-height: 300px;
          overflow-y: auto;
        }
      </style>
    </head>
    <body>
      <div class="admin-box">
        <h2>Admin Log Viewer</h2>
        <form id="logForm">
          <input name="password" type="password" placeholder="Enter admin password" required />
          <button type="submit">Get Logs</button>
        </form>
        <pre id="logs">Logs will appear here after login.</pre>
      </div>

      <script>
        const form = document.getElementById('logForm');
        const logsPre = document.getElementById('logs');

        form.addEventListener('submit', async e => {
          e.preventDefault();
          const password = form.password.value;

          try {
            const res = await fetch('/admin/logs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password })
            });

            const text = await res.text();
            logsPre.textContent = res.ok ? text : "Error: " + text;
          } catch (err) {
            logsPre.textContent = 'Fetch error: ' + err.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
