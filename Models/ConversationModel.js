const mongoose = require('mongoose')

const ConversationSchema = new mongoose.Schema({
    Members : {
        type : Array
    }
    },  {
        timestamps : true,
        collection : 'Conversations'
    })

const Conversation = new mongoose.model("Conversation" , ConversationSchema)

module.exports = Conversation