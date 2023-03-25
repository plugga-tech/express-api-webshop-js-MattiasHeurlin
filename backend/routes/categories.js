var express = require('express');
var router = express.Router();
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

function apiKeyVerifier(req, res, next) {
  const apiKey = req.body.token;

  if (!apiKey) {
    return res.status(400).send('Missing API key');
  }

  if (apiKey !== process.env.API_KEY) {
    console.log('' + apiKey + ' ' + process.env.API_KEY)
    return res.status(401).send('Invalid API key');
  }

  next();
}

router.get('/', (req, res) => {
  req.app.locals.db.collection('categories').find({}).toArray()
    .then(categories => res.send(categories))
    .catch(err => {
      console.log('Error fetching categories:', err);
      res.status(500).send('Error fetching categories:', err);
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
    .then(result => res.send('Category Added ' + result))
    .catch(err => {
      console.log('Error adding category:', err);
      res.status(500).send('Error adding category:', err);
    });
});

module.exports = router;