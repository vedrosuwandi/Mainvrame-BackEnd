const express = require('express');
const router = express.Router();


const VerifyController = require('../Controllers/VerifyController');

// Verification Route

//Get Data for Verify
router.get('/:id' , VerifyController.getVerificationData);

//Send Code for Register
router.post('/send/:id' , VerifyController.sendLink);

// generate the verification code when the user is changing their email
router.post('/changeemailcode' , VerifyController.genChangeEmailCode);

//Verify Account
router.post('/:code' , VerifyController.verifyAccount);


module.exports = router