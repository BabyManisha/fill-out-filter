// get the packages & dependencies we need
const express = require('express');
const axios = require('axios');

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

// listen to the port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});