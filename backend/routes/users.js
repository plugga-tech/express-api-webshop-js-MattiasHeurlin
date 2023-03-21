const express = require('express');
const CryptoJS = require("crypto-js");
const ObjectId = require('mongodb').ObjectId;



const router = express.Router();
const secret_key = '1234key1234'; // TODO move to .env file

router.get('/', function (req, res, next) {
   req.app.locals.db.collection('users').find({}, { projection: { userPassword: 0 } }).toArray()
      .then((result) => {
         res.send(result);
      })
      .catch((err) => {
         console.log('Error Accessing user Database ' + err);
         return res.status(500).send('Error Accessing user Database ' + err);
      });
});

router.post('/', async function (req, res, next) {
   try {
     const result = await req.app.locals.db.collection('users').findOne({ _id: new ObjectId(req.body.id) });
     res.send(result);
   } catch (err) {
     console.log('Error Accessing user Database ' + err);
     return res.status(500).send('Error Accessing user Database ' + err);
   }
 });



router.post('/login', function (req, res, next) {
   const loginEmail = req.body.email;
   const loginPassword = req.body.password;

   req.app.locals.db.collection('users').findOne({ userEmail: loginEmail })
      .then((result) => {
         if (!result) {
            return res.status(401).send('User Name Not found');
         }
         const hashedLoginPassword = CryptoJS.SHA256(loginPassword).toString();
         if (result.userPassword !== hashedLoginPassword) {
            return res.status(401).send('Password is Incorrect');
         }
         return res.status(200).send('Login Successful');
      })
      .catch((err) => {
         console.log('Server Error');
         return res.status(500).send('Internal Server Error ' + err);
      });
});

router.post('/add', function (req, res, next) {
   const newUserName = req.body.name;
   const newUserEmail = req.body.email;
   const newUserPassword = req.body.password;

   if (!newUserName || !newUserPassword) {
      return res.status(400).send('Missing User Name or Password');
   }

   const hashedPassword = CryptoJS.SHA256(newUserPassword).toString();

   req.app.locals.db.collection('users').insertOne({ userName: newUserName, userEmail: newUserEmail, userPassword: hashedPassword })
      .then((result) => {
         res.send(result);
      })
      .catch((err) => {
         console.log('Error Accessing User Database ' + err);
         return res.status(500).send('Error Accessing User Database ' + err);
      });
});

module.exports = router;