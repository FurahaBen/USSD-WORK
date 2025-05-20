const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ussd_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});

// Main USSD Endpoint
app.post('/', (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const textValue = text.split('*');

  let level = textValue.length;
  let response = '';

  // Save or update session
  const currentInput = db.escape(text);
  const lang = textValue[0] === '1' ? 'EN' : (textValue[0] === '2' ? 'RW' : '');

  if (level === 1 && text === '') {
    response = `CON Welcome / Murakaza neza:
1. English
2. Kinyarwanda`;

    db.query(
      'REPLACE INTO sessions(sessionID, phoneNumber, userInput, language) VALUES (?, ?, ?, ?)',
      [sessionId, phoneNumber, '', ''],
    );
  } else if (level === 1) {
    db.query(
      'UPDATE sessions SET language = ? WHERE sessionID = ?',
      [lang, sessionId]
    );
    response = lang === 'EN' ? 
      `CON Main Menu:\n1. View Phones\n2. My Transactions\n0. Back` :
      `CON Menyu Nyamukuru:\n1. Reba Telefoni\n2. Amakuru Yanjye\n0. Subira Inyuma`;
  } else if (level === 2 && textValue[1] === '1') {
    response = lang === 'EN' ?
      `CON Choose Phone:\n1. iPhone 14\n2. Samsung Galaxy S22\n3. Tecno Spark 10\n4. Infinix Note 12` :
      `CON Hitamo Telephone:\n1. iPhone 14\n2. Samsung Galaxy S22\n3. Tecno Spark 10\n4. Infinix Note 12`;
  } else if (level === 3) {
    const phoneFeatures = {
      '1': 'iPhone 14: 6.1” Display, A15 Bionic, iOS 16, 5G',
      '2': 'Samsung S22: AMOLED, Snapdragon 8, Android 13, 5G',
      '3': 'Tecno Spark 10: 6.6” Display, Helio G37, Android 12',
      '4': 'Infinix Note 12: 6.7” AMOLED, Helio G88, 5000mAh'
    };
    const phone = phoneFeatures[textValue[2]] || 'Invalid choice';

    // Save transaction
    db.query(
      'INSERT INTO transactions(phoneNumber, action) VALUES (?, ?)',
      [phoneNumber, `Viewed ${phone}`]
    );

    response = `END ${phone}`;
  } else {
    response = 'END Invalid input or navigation.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD app running on port ${PORT}`);
});
