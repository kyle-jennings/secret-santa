// node register.js email=trebgur3@gmail.com password="bitiajfalpom" birthyear=1983 sex=male
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

const S3 = new AWS.S3();
const saltRounds = 10;
const sex = /^(male|female)$/;
const gender = /^(Agender|Androgyne|Androgynous|Bigender|Cisgender|Transgender Female|TransgenderTranssexual Female|Transsexual Male|Transsexual Person|male|female)$/;
const required = ['email', 'password', 'birthdate'];
const { BUCKET_NAME } = process.env;
const { HASH_KEY } = process.env;


/** custom method to generate authToken  */
const generateAuthToken = function (user) {
  const data = {
    key: user.email,
  };
  return jwt.sign(data, HASH_KEY);
};

function updateList(user) {

  if (!user.list) {
    user.list = [];
  }

  if (!user.settings) {
    user.settings = {};
  }

  if (!user.account) {
    user.account = {};
  }

  return ['list', 'settings', 'account'].map((f) => {
    const obj = {
      Bucket: BUCKET_NAME,
      Key: user.email + '/' + f + '.json',
      Body: JSON.stringify(user[f]),
      ContentType: 'application/json',
    };
    return S3.putObject(obj)
      .promise()
      .then(data => Promise.resolve(user))
      .catch(err => Promise.resolve(user));
  });
}

/**
 * First we check to see whether or not an account has been created for that email.
 *
 * @param   object  user  user's email and password
 *
 * @return  promise        [return description]
 */
function doesUserExist(user) {
  const object = {
    Bucket: BUCKET_NAME,
    Key: user.email,
  };
  const userExists = {
    status: 401,
    StatusDescription: 'User already exists',
  };

  const otherErr = {
    status: 500,
    StatusDescription: 'something went wrong',
  };
  console.log('checking for existing user');
  return S3.headObject(object)
    .promise()
    .then(() => Promise.reject(userExists))
    .catch((err) => {
      return err.code === 'NotFound' ? Promise.resolve(user) : Promise.reject(otherErr);
    });
}

/**
 * The header response, sets up the CORS shit
 *
 * @param   string  statusCode  the status code of the response
 * @param   string  message     message description
 *
 * @return  object              the response body
 */
function buildResponse(statusCode, message) {
  let body = { message };

  return {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    statusCode,
    body: JSON.stringify(body),
  };
}


function validateArgs(user) {
  return required.every(e => Object.keys(user).includes(e) && user[e] != null );
}

/**
 * No user was created, so we create one now.  
 * 
 * We set the folder's meta data to include the birthyear and hashed password.
 * We also set the user's sex and other information if available.
 *
 * @param   {[type]}  user  [user description]
 *
 * @return  promise        [return description]
 */
function createUser(user) {

  console.log('creating user');
  const object = {
    Bucket: BUCKET_NAME,
    Key: user.email + '/',
    Metadata: {
      password: bcrypt.hashSync(user.password, saltRounds),
    }
  };
  console.log('creating user', object);
  return S3.putObject(object)
    .promise()
    .then(() => Promise.resolve(user))
    .catch(err => Promise.reject(err));
}

/**
 * return the response with the generated auth token
 *
 * @param   {[type]}  user  [user description]
 *
 * @return  {[type]}        [return description]
 */
function sendAuth(user) {
  const date = new Date();
  const body = {
    status: 200,
    authToken: generateAuthToken(user),
    email: user.email,
    list: user.list || {},
    expires: date.setMinutes(date.getMinutes() + 60),
  };
  return Promise.resolve(body);
}

module.exports = function (req, res) {
  const body = req.body || {};
  const token = req.headers.authToken || null;
  const user = {
    email: body.email || null,
    password: body.password || null,
    birthdate: body.birthdate || null,
    list: body.list || null,
  };

  if (!validateArgs(user)) {
    const response = {
      status: '401',
      statusDescription: 'required fields not found',
      body: buildResponse(401, 'required fields not found'),
    };
    return Promise.reject(response);
  }

  return doesUserExist(user)
    .then(user => createUser(user))
    .catch(err => Promise.reject(err))
    .then(user => updateList(user))
    .then(user => sendAuth(user));
};
