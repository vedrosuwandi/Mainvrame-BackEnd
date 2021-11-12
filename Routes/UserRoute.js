const express = require('express');
const router = express.Router();

const UserController = require('../Controllers/UserController');
const Authenticate = require('../Middleware/Authenticate');
const RefreshAuthenticate = require('../Middleware/RefreshAuthenticate');

// User (/user)
router.get('/index' , Authenticate, UserController.index);
router.get('/getuser' , Authenticate, UserController.getuser);
router.get('/show/:Username' , Authenticate, UserController.show_spec);
router.post('/create' , Authenticate, UserController.create);
router.post('/update' , Authenticate, UserController.update);
router.post('/topup/:Username' , Authenticate, UserController.topup);
router.post('/remove' , Authenticate, UserController.remove);
router.post('/changepass' , UserController.changePass);



module.exports = router;