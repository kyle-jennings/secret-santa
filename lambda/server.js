const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRouter = require('./express/_router');

const app = express();
const router = express.Router();

const corsOptions = {
  origin: '*',
  methods: 'GET,PUT,POST,OPTIONS',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, x-auth-token, authToken',
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
app.use(apiRouter);

module.exports = app;
