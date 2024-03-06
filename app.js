// get the packages & dependencies we need
const express = require('express');
const axios = require('axios');

// Load environment variables
require('dotenv').config();

// create our app w/ express
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse the body of the request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to SM World!!');
});

// Endpoint for fetching the data from the fillout API
app.get('/:formId/filteredResponses', async (req, res) => {
  try {
    const { formId } = req.params;

    const apiKey = process.env.FILLOUT_API_KEY;

    const response = await axios.get(`${process.env.FILLOUT_API_HOST}/${process.env.FILLOUT_API_PREFIX}/forms/${formId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${apiKey}` 
        } 
      });
    res.send(response.data);
  }
  catch (error) {
    console.error('Error fetching the data from the fillout API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// listen to the port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});