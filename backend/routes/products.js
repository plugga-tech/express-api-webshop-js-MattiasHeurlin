var express = require('express');
var router = express.Router(); 
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

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


/* GET users listing. */
router.get('/', function (req, res, next) {
  req.app.locals.db.collection('products').find({}).toArray()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log('Error Accessing product Database ' + err);
      return res.status(500).send('Error Accessing product Database ' + err);
    });
});

router.get('/:id', function (req, res, next) {
  req.app.locals.db.collection('products').findOne({ _id: new ObjectId(req.params.id) })
    .then((result) => {
      if (!result) {
        return res.status(404).send('Product Not Found');
      }
      res.send(result);
    })
    .catch((err) => {
      console.log('Error Accessing product Database ' + err);
      return res.status(500).send('Error Accessing product Database ' + err);
    });
});


router.get('/category/:id', function (req, res, next) {
  const categoryId = new ObjectId(req.params.id);

  req.app.locals.db.collection('products').find({ category: categoryId }).toArray()
    .then((result) => {
      if (!result || result.length === 0) {
        return res.status(404).send('Product(s) Not Found');
      }
      res.send(result);
    })
    .catch((err) => {
      console.log('Error Accessing product Database ' + err);
      return res.status(500).send('Error Accessing product Database ' + err);
    });
});

router.post('/add', apiKeyVerifier, async function (req, res, next) {
  const categoryValue = req.body.category;

  // Check if the category exists (by name or ID)
  try {
    const category = await req.app.locals.db.collection('categories').findOne({
      $or: [
        { name: categoryValue },
        { _id: ObjectId.isValid(categoryValue) ? new ObjectId(categoryValue) : null },
      ],
    });

    if (!category) {
      return res.status(404).send('Category not found');
    }

    const newProduct = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      lager: req.body.lager,
      category: category._id, 
    };

    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.lager) {
      return res.status(400).send('Missing Fields');
    }

    await req.app.locals.db.collection('products').insertOne(newProduct);
    console.log('Product added ' + newProduct.name);
    res.send('Product added ' + newProduct.name);
  } catch (err) {
    console.log('Error accessing product or category database ' + err);
    return res.status(500).send('Error accessing product or category database ' + err);
  }
});



module.exports = router;
