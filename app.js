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

// Default user to github wiki page
app.get('/', (req, res) => {
  res.redirect('https://github.com/BabyManisha/fill-out-filter/wiki/Welcome-to-Fill%E2%80%90Out%E2%80%90Filter');
});

// Endpoint for fetching the data from the fillout API
app.get('/:formId/filteredResponses', async (req, res) => {
  try {
    const { formId } = req.params;
    const { filters = null , ...otherQueryParams } = req.query;
    // Converting JSON stringified filters to an array of objects
    const parsedFilters = JSON.parse(filters);

    const pageSize = parseInt(req.query.limit || process.env.DEFAULT_LIMIT);
    const apiKey = process.env.FILLOUT_API_KEY;

    let queryParams = new URLSearchParams(otherQueryParams);

    const fillOutAPI = `${process.env.FILLOUT_API_HOST}/${process.env.FILLOUT_API_PREFIX}/forms/${formId}/submissions`;

    // Fetch initial page of responses to get total count
    const initialResponse = await axios.get(`${fillOutAPI}?${queryParams}`, { headers: { Authorization: `Bearer ${apiKey}` } });

    // Fetching the data from the fillout API concurrently for the subsequnce pages
    const fetchAllData = async () => {
      const totalResponses = initialResponse.data?.totalResponses;
      const offset = parseInt(req.query.offset || process.env.DEFAULT_OFFSET);
      const promises = [initialResponse];

      for (let page = offset + pageSize; page < totalResponses;) {
        queryParams.set('offset', page);
        promises.push(axios.get(`${fillOutAPI}?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}` 
          } 
        }));
        page += pageSize;
      }

      const responses = await Promise.all(promises);
      return responses.flatMap(response => response.data.responses);
    }

    const allResponses = await fetchAllData();

    const returnResponse = (responseData) => {
      const totalResponses = responseData.length;
      res.json({
        responses: responseData,
        totalResponses,
        pageCount: Math.ceil(totalResponses / pageSize),
      });
    }

    // Filtering the response based on the filters
    if (parsedFilters) {
      const filteredData = allResponses.filter(submission => {
        return parsedFilters.every((filter) => {
          const question = submission.questions.find(q => q.id === filter.id);

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
      returnResponse(filteredData);
    } else {
      returnResponse(allResponses);
    }
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