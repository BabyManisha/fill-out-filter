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
    const { filters = null , ...otherQueryParams } = req.query;

    console.log("otherQueryParams:", otherQueryParams);

    // Converting JSON stringified filters to an array of objects
    const parsedFilters = JSON.parse(filters);
    console.log("parsedFilters", parsedFilters);

    const apiKey = process.env.FILLOUT_API_KEY;

    const fillOutAPI =  `${process.env.FILLOUT_API_HOST}/${process.env.FILLOUT_API_PREFIX}/forms/${formId}/submissions?${new URLSearchParams(otherQueryParams)}`;

    console.log("fillOutAPI:", fillOutAPI);

    const response = await axios.get(fillOutAPI, {
      headers: {
        'Authorization': `Bearer ${apiKey}` 
      } 
    });

    // console.log("response.data===>", response.data);
    
    // Filtering the response based on the filters
    if (parsedFilters) {
      const filteredData = response.data?.responses?.filter(submission => {
        return parsedFilters.every((filter) => {
          const question = submission.questions.find(q => q.id === filter.id);

          console.log("question:", question);

          if (!question) return false;

          const responseValue = question.value;
          const filterValue = Date.parse(filter.value) ? new Date(filter.value) : filter.value;

          // Checking for Date type Strings for easy comparison
          let parsedResponseValue;
          if (typeof responseValue === 'string') {
            // parsing ISO dates if the response value is a date
            parsedResponseValue = Date.parse(responseValue) ? new Date(responseValue) : responseValue;
          } else {
            parsedResponseValue = responseValue;
          }

          console.log("parsedResponseValue:", parsedResponseValue);
          console.log("filterValue:", filterValue);

          switch (filter.condition) {
            case 'equals':
              return parsedResponseValue === filterValue;
            case 'does_not_equal':
              return parsedResponseValue !== filterValue;
            case 'greater_than':
              return parsedResponseValue > filterValue;
            case 'less_than':
              return parsedResponseValue < filterValue;
            default:
              return false;
          }
        });
      });

      // Sending the filtered data as the response
      res.json({
        responses: filteredData,
        totalResponses: filteredData.length,
        pageCount: 1,
      });
    }
    else
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