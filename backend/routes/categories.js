var express = require('express');
var router = express.Router();
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

function apiKeyVerifier(req, res, next) {
  const apiKey = req.body.token;

  if (!apiKey) {
    return res.status(400).send({ message: 'Missing API key'});
  }

  if (apiKey !== process.env.API_KEY) {
    console.log('' + apiKey + ' ' + process.env.API_KEY)
    return res.status(401).send({ message: 'Invalid API key' });
  }

  next();
}

router.get('/', (req, res) => {
  req.app.locals.db.collection('categories').find({}).toArray()
    .then(categories => res.send(categories))
    .catch(err => {
      console.log('Error Accessing Database', err);
      res.status(500).send( { message: 'Error Accessing Database ' + err });
    });
});

router.post('/add', apiKeyVerifier, (req, res) => {
  const newCategory = {
    name: req.body.name
  };
  if (!newCategory.name) {
    return res.status(400).send('Missing Fields');
  }
  req.app.locals.db.collection('categories').insertOne(newCategory)
    .then(result => res.send({ message: 'Category Added ' + result}))
    .catch(err => {
      console.log('Error adding category:', err);
      res.status(500).send({ message: 'Error Acessing Database ' + err});
    });
});

module.exports = router;