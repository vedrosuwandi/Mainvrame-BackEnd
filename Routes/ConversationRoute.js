const express = require('express');
const router = express.Router();

const ConversationController = require('../Controllers/ConversationController');

// Add Conversation
router.post('/add', ConversationController.newConversation);

//Get user Conversation
router.get('/:id' , ConversationController.getConversation);
router.get('/findconv/:id1/:id2' , ConversationController.gettwoConversation);

// Delete Conversation
router.delete('/delete/:id1/:id2' , ConversationController.deleteConversation);

router.get('/lookup/:id' , ConversationController.lookUptest);


module.exports = router