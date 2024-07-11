const express = require("express");
const axios = require("axios");
require('dotenv').config();
const app = express();
const PORT = 9876;
const MAX_RESPONSE_TIME = 500;
const WINDOW_SIZE = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let numberWindow = [];

const fetchNumbers = async (type) => {
  try {
    // const response = await axios.get(`${process.THIRD_PARTY_API_ENDPOINT}/${type}`, {
    const response = await axios.get(`http://20.244.56.144/test/${type}`, {
      headers: {
        // 'Authorization': `Bearer ${process.TOKEN}`
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwNzE1OTM5LCJpYXQiOjE3MjA3MTU2MzksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjU1OThlMzQ1LTNlNmUtNDFkNi1iNmJhLTg0MjQ5Y2JjYzJiNCIsInN1YiI6ImFuaWlpZ3VwdGEyM0BnbWFpbC5jb20ifSwiY29tcGFueU5hbWUiOiJBbmlrZXQiLCJjbGllbnRJRCI6IjU1OThlMzQ1LTNlNmUtNDFkNi1iNmJhLTg0MjQ5Y2JjYzJiNCIsImNsaWVudFNlY3JldCI6IldXUnlLa2p4Q1hOSWNLV3UiLCJvd25lck5hbWUiOiJBbmlrZXQiLCJvd25lckVtYWlsIjoiYW5paWlndXB0YTIzQGdtYWlsLmNvbSIsInJvbGxObyI6IjA0ODE5MDExNzIxIn0.9Nj6P8l5MlQqV-nkOIGD5UD8FY3ocrTFpSK0XoGIObI`
      },
      timeout: MAX_RESPONSE_TIME
    });
    return response.data.numbers || [];
  } catch (error) {
    console.error('Error fetching numbers:', error.message);
    return [];
  }
};

const calculateAverage = (nums) => {
  const sum = nums.reduce((acc, num) => acc + num, 0);
  return nums.length ? sum / nums.length : 0;
};

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  let qualifiedNumbers = [];

  // Validate numberid
  if (!['p', 'f', 'e', 'r'].includes(numberid)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  // Fetch numbers based on type
  switch (numberid) {
    case 'p':
      qualifiedNumbers = await fetchNumbers('primes');
      break;
    case 'f':
      qualifiedNumbers = await fetchNumbers('fibo');
      break;
    case 'e':
      qualifiedNumbers = await fetchNumbers('even');
      break;
    case 'r':
      qualifiedNumbers = await fetchNumbers('rand');
      break;
  }

  // Ensure unique numbers
  qualifiedNumbers = [...new Set(qualifiedNumbers)];

  // Store current state before updating
  const windowPrevState = [...numberWindow];

  // Add new numbers to the window
  qualifiedNumbers.forEach(num => {
    if (!numberWindow.includes(num)) {
      if (numberWindow.length < WINDOW_SIZE) {
        numberWindow.push(num);
      } else {
        numberWindow.shift();
        numberWindow.push(num);
      }
    }
  });

  // Store current state after updating
  const windowCurrState = [...numberWindow];
  const average = calculateAverage(windowCurrState);

  res.json({
    windowPrevState,
    windowCurrState,
    numbers: qualifiedNumbers,
    avg: average.toFixed(2)
  });
});

app.get("/", (req, res) => {
  res.send("All is well!");
});

app.listen(PORT, () => {
  console.log("Server is running at", PORT);
});
