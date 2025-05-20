const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// PostgreSQL connection using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create tables if not exist
const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      sessionID TEXT PRIMARY KEY,
      phoneNumber TEXT,
      userInput TEXT,
      language TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      phoneNumber TEXT,
      action TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

createTables().catch(console.error);

// USSD Logic
app.post('/', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const inputs = text.split('*');
  const level = inputs.length;
  const lang = inputs[0] === '1' ? 'EN' : (inputs[0] === '2' ? 'RW' : '');

  let response = '';

  try {
    if (text === '') {
      response = `CON Welcome / Murakaza neza:
1. English
2. Kinyarwanda`;

      await pool.query(
        `INSERT INTO sessions (sessionID, phoneNumber, userInput, language)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (sessionID) DO NOTHING`,
        [sessionId, phoneNumber, '', '']
      );
    } else if (level === 1) {
      await pool.query(
        'UPDATE sessions SET language = $1 WHERE sessionID = $2',
        [lang, sessionId]
      );

      response = lang === 'EN' ?
        `CON Main Menu:\n1. View Phones\n2. My Transactions\n0. Back` :
        `CON Menyu Nyamukuru:\n1. Reba Telefoni\n2. Amakuru Yanjye\n0. Subira Inyuma`;
    } else if (level === 2 && inputs[1] === '1') {
      response = lang === 'EN' ?
        `CON Choose Phone:\n1. iPhone 14\n2. Samsung Galaxy S22\n3. Tecno Spark 10\n4. Infinix Note 12` :
        `CON Hitamo Telephone:\n1. iPhone 14\n2. Samsung Galaxy S22\n3. Tecno Spark 10\n4. Infinix Note 12`;
    } else if (level === 3) {
      const features = {
        '1': 'iPhone 14: iOS 16, 6.1” Display, 5G',
        '2': 'Samsung S22: Android 13, AMOLED, 5G',
        '3': 'Tecno Spark 10: Android 12, 6.6” Display',
        '4': 'Infinix Note 12: 5000mAh, 6.7” AMOLED'
      };
      const choice = inputs[2];
      const detail = features[choice] || 'Invalid choice';

      await pool.query(
        `INSERT INTO transactions (phoneNumber, action)
         VALUES ($1, $2)`,
        [phoneNumber, `Viewed ${detail}`]
      );

      response = `END ${detail}`;
    } else {
      response = 'END Invalid input.';
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
  } catch (err) {
    console.error(err);
    res.send('END Error processing request.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD app running on port ${PORT}`);
});
