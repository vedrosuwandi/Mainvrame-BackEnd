const express = require('express');
const router = express.Router();

const RefreshAuthenticate = require('../Middleware/RefreshAuthenticate');
const Authenticate = require('../Middleware/Authenticate');

const OnlineController = require('../Controllers/OnlineController');

router.get('/checktoken', RefreshAuthenticate, OnlineController.checktoken);
router.get('/checkstatus/:username' , OnlineController.checkstatus);

router.get('/checkhidden/:username' , OnlineController.checkhidden );
router.post('/sethidden/:username' , OnlineController.sethidden);

module.exports = router