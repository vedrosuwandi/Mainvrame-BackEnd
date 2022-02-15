const express = require('express');
const router = express.Router();

const RefreshAuthenticate = require('../Middleware/RefreshAuthenticate');

const AuthController = require('../Controllers/AuthController');



// Authorization
router.post('/register' , AuthController.register);
router.post('/login' , AuthController.login);
router.post('/googlelogin' , AuthController.googleLogin);
router.post('/facebooklogin' , AuthController.facebookLogin);

// Refresh the token with the refresh token when the token is expired
router.get('/refresh' , RefreshAuthenticate, AuthController.refresh);


module.exports = router