const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = '';

  // Menu navigation logic
  if (text === '') {
    response = `CON Hitamo Telephone:
1. iPhone 14
2. Samsung Galaxy S22
3. Tecno Spark 10
4. Infinix Note 12`;
  } else if (text === '1') {
    response = `END iPhone 14 Features:
- 6.1-inch Super Retina XDR display
- A15 Bionic chip
- Dual 12MP cameras
- iOS 16
- 5G support`;
  } else if (text === '2') {
    response = `END Samsung Galaxy S22 Features:
- 6.1-inch Dynamic AMOLED display
- Exynos 2200 / Snapdragon 8 Gen 1
- Triple camera system
- Android 13
- 5G support`;
  } else if (text === '3') {
    response = `END Tecno Spark 10 Features:
- 6.6-inch HD+ display
- MediaTek Helio G37
- 50MP AI Dual Camera
- Android 12
- 5000mAh Battery`;
  } else if (text === '4') {
    response = `END Infinix Note 12 Features:
- 6.7-inch AMOLED display
- MediaTek Helio G88
- 50MP Triple Camera
- Android 11
- 5000mAh Battery`;
  } else {
    response = 'END Icyo wahisemo nticyumvikanye.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD phone menu app running on port ${PORT}`);
});
const { Pool } = require('pg');

// Replace this with your actual Render connection string
const pool = new Pool({
  connectionString: 'postgres://username:password@hostname:port/databasename',
  ssl: { rejectUnauthorized: false } // Required for Render SSL
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL at:', res.rows[0].now);
  }
});
