const mongoose = require('mongoose');
const ObjectID = mongoose.Types.ObjectId;

const ChatModel = mongoose.Schema({
    ConversationID : {
        type: ObjectID
    },
    Sender : {
        type : String
    },
    Text : {
        type : String
    }
},
    {
        timestamps : true,
        collection : "Chats"
    }
)

const Chat = new mongoose.model("Chat" , ChatModel);

module.exports = Chat