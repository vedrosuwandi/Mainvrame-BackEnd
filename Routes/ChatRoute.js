const express = require('express')
const router = express.Router()

const ChatController = require('../Controllers/ChatController');


// Send Chat
router.post('/send' , ChatController.sendMessage);

// Show the Chat
router.get('/:convID' , ChatController.getMessage);

//Delete Chat (All content of the conversation);
router.delete('/delete/:convID' , ChatController.deleteMessage);

router.delete('/unsend/:convID' , ChatController.unsendMessage);

module.exports = router

