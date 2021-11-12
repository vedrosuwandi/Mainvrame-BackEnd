const express = require('express');
const router = express.Router();

const AuthController = require('../Controllers/AuthController');
const RefreshAuthenticate = require('../Middleware/RefreshAuthenticate');

// Authorization
router.post('/register' , AuthController.register);
router.post('/login' , AuthController.login);

// Refresh the token with the refresh token when the token is expired
router.get('/refresh' , RefreshAuthenticate, AuthController.refresh);


module.exports = router