const Conversation = require('../Models/ConversationModel');
const Chat = require('../Models/ChatModel');

const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;

//Add new conversation
const newConversation = (req, res) =>{
    const senderID = req.body.SenderID;
    const receiverID = req.body.ReceiverID;

    const conversation = new Conversation({
        Members : [
            senderID , receiverID
        ]
    })

    conversation.save()
    .then((response)=>{
        res.status(200).json(response)
    }).catch((err)=>{
        res.status(500).json(
            err
        )
    })
}

// get conversation of user
const getConversation = (req, res) =>{
    const id = req.params.id;

    Conversation.find({
        Members : {
            $in: [
                id
            ]
        }
    }).then((response)=>{
        res.status(200).json(response)
    })
    .catch((err)=>{
        res.status(500).json(err)
    })

}


const gettwoConversation = (req, res) =>{
    const id1 = req.params.id1;
    const id2 = req.params.id2;

    Conversation.findOne({
        Members : {
            $all : [
                id1, id2
            ]
        }
    }).then((response)=>{
        res.status(200).json(response);
    }).catch((err)=>{
        res.status(500).json(err)
    })

}


const deleteConversation = (req, res) =>{
    const id1 = req.params.id1;
    const id2 = req.params.id2;

    Conversation.findOneAndDelete({
        Members : {
            $all : [
                id1, id2
            ]
        }
    }).then((response)=>{
        res.status(200).json(response)
    }).catch((err)=>{
        res.status(500).json(err)
    })

}

const lookUptest = (req , res) =>{
    const id = req.params.id;

    Conversation.aggregate([
        { $match: { 
            _id: ObjectID(id)
            } 
        },
        {
            $lookup : {
                from : 'Chats',
                localField : '_id',
                foreignField : 'ConversationID',
                as : 'chats'
            }
        },
        {
            $project : {
                chats : 1
            }
        }
    ])
    .then((response)=>{
        Chat.remove({
           ConversationID : id
        })
    }).catch((err)=>{
        res.status(500).json(err.message);
    })
}


module.exports = {
    newConversation,
    getConversation,
    gettwoConversation,
    deleteConversation,
    lookUptest
}