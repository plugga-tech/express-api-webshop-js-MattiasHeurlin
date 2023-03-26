var express = require('express');
var router = express.Router();
const ObjectId = require('mongodb').ObjectId;

function apiKeyVerifier(req, res, next) {
  const apiKey = req.body.token;
  if (!apiKey) {
    return res.status(400).send({ message: 'Missing API key' });
  }

  if (apiKey !== process.env.API_KEY) {

    return res.status(403).send({ message: 'Invalid API key' });
  }

  next();
}

/* GET home page. */
router.get('/all/:apiKey', function (req, res, next) {
  if (req.params.apiKey !== process.env.API_KEY) {
    return res.status(401).send({ message: 'Unauthorized' });
  };

  req.app.locals.db.collection('orders').find({}).toArray().catch((err) => {
    console.log('Error Accessing orders Database ' + err);
    return res.status(500).send({ message: 'Error Accessing orders Database ' + err });
  }).then((result) => {
    res.send(result);
  });
});

router.post('/add', /* Tester kräver utan, apiKeyVerifier, */ async function (req, res, next) {
  const orderProducts = req.body.products;
  if (!req.body.user || !req.body.products) {
    console.log('UserId Or Products Not Found')
    return res.status(400).send({ message: 'UserId Or Products Not Found' });
  }
  try {
    const user = await req.app.locals.db.collection('users').findOne({ _id: new ObjectId(req.body.user) });
    if (!user) {
      return res.status(404).send({ message: 'User Not Found' });
    }

    const newOrder = {
      userId: user._id,
      products: orderProducts
    }

    await req.app.locals.db.collection('orders').insertOne(newOrder);
    console.log(orderProducts )
    for (const product of orderProducts) {
      try {
       req.app.locals.db.collection('products').updateOne(
        { _id: new ObjectId(product._id) },
        { $inc: { lager: -Number(product.quantity) } }
      )
      } catch (err) {
        console.log('Error Accessing products Database ' + err);
        return res.status(500).send({ message: 'Error Accessing products Database ' + err });
      }
       console.log('Product updated successfully' + product.productId + ' ' + Number(product.quantity))
    }

   

    console.log('Order added successfully');
    res.send({ Message: 'Order added successfully: ' + newOrder._id });
  } catch (err) {
    console.log('Error Accessing orders Database ' + err);
    return res.status(500).send({ message: 'Error Accessing orders Database ' + err });
  }
});

router.post('/user', apiKeyVerifier, async function (req, res, next) {
  if (!req.body.user) {
    console.log('UserId Not Present')
    return res.status(400).send({ message: 'UserId Not Present' });
  }
  try {
    const userOrders = await req.app.locals.db.collection('orders').find({ userId: new ObjectId(req.body.user) }).toArray();
    if (!userOrders) {
      return res.status(404).send({ message: 'UseriD Not Found' });
    }
    res.send(userOrders);
  }
  catch (err) {
    console.log('Error Accessing orders Database ' + err);
    return res.status(500).send({ message: 'Error Accessing orders Database ' + err });
  }
});

module.exports = router;
