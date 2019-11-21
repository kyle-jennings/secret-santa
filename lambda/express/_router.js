const express = require('express');
const login = require('./login');
const isLoggedIn = require('./isLoggedIn');
const register = require('./register');
const retrievePassword = require('./retrieve-password');
const resetPassword = require('./reset-password');
const updateList = require('./update-list');

const router = express.Router();

/**
 * catch all
 */
router.route('/')
  .get((req, res) => {
    res.end('This site is my site, this site is your site')
  })
  .post((req, res) => {
    res.end('nothing to see here');
  });

/**
 * Activates an account - this is a place holder
 */
router.route('/activate')
  .post((req, res) => {
    // if the jwt hasnt expired, then create the folder with the email and password
    res.end('if the jwt hasnt expired, then create the folder with the email and password');
  });

/**
 * Registers a new account
 */
router.route('/register')
  .post((req, res) => {
    const token = req.headers['authToken'] || null;

    if (isLoggedIn(token)) {
      res.end('already logged in, what are you trying to do?');
    }
    register(req)
      .then((response) => {
        res.end(JSON.stringify(response));
      })
      .catch((err) => {
        res.end(JSON.stringify(err));
      });
  });

/**
 * Logins the user in or returns an error message
 */
router.route('/login')
  .post(function (req, res) {
    const token = req.headers.authToken || null;

    if (isLoggedIn(token)) {
      console.log('logged in');
    }
    console.log('not logged in - trying to login now');
    login(req)
      .then((response) => {
        console.log(response);
        res.end(JSON.stringify(response));
      })
      .catch((err) => {
        console.log('error', err)
        res.end(JSON.stringify(err));
      });
  });

/**
 * updates teh user list
 * this happens everytime a new "question" is answered
 */
router.route('/update-list')
  .post((req, res) => {
    updateList(req, res)
      .then((response) => {
        res.end(JSON.stringify(response));
      })
      .catch((err) => {
        res.end(JSON.stringify(err));
      });
  });

//
router.route('/retrieve-password')
  .post((req, res) => {

    retrievePassword(req)
      .then((response) => {
        const body = {
          status: 200,
          email: response.email,
          message: 'Password for ' + response.email + 'has been mailed.',
        }
        res.end(JSON.stringify(body));
      })
      .catch((err) => {
        res.end(JSON.stringify(err));
      });
  });

router.route('/reset-password')
  .post((req, res) => {

    const body = req.body || {};
    const user = {
      email: body.email || null,
      password: body.password || null,
    };
  
    resetPassword(req)
      .then((response) => {
        res.end(JSON.stringify(response));
      })
      .catch((err) => {
        res.end(JSON.stringify(err));
      });
  });


router.route('/reset-password')
  .post((req, res) => {

    resetPassword(req)
      .then((response) => {
        res.end(JSON.stringify(response));
      })
      .catch((err) => {
        res.end(JSON.stringify(err));
      });
  });

/**
 * PLACEHOLDER - a user will submit a sex act
 */
// '/create-act'
// '/partner-connect-request'
// '/update-account'
// '/deactivate'
// '/delete-account'
module.exports = router;
