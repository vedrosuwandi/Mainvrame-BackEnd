const Chat = require('../Models/ChatModel');

// 
const sendMessage = (req, res) =>{
    const body = req.body

    const newChat = new Chat(body)

    newChat.save()
    .then((response)=>{
        res.status(200).json(response)
    }).catch((err)=>{
        res.status(500).json(err)
    })

}


const getMessage = (req, res) =>{
    const id = req.params.convID;

    // find the message in last week
    // 1 week =  604800000 milliseconds
    // 1 month  = 2629800000 milliseconds
    Chat.find({
        $and : [
            {
                ConversationID : id
            },
            // {
            //     createdAt : {
            //         $gte: new Date(new Date() -  2629800000)
            //     }
            // }
        ]
    }).then((response)=>{
        res.status(200).json(response)
    }).catch((err)=>{
        res.status(500).json(err)
    })
}

const deleteMessage = (req, res) =>{
    const id = req.params.convID;

    Chat.deleteMany({
        ConversationID : id
    }).then((response)=>{
        res.status(200).json(response)
    }).catch((err)=>{
        res.status(500).json(err)
    })
}

const unsendMessage = (req, res) =>{
    const convID = req.params.convID;
    const id = req.body.ID;
    
    Chat.deleteOne({
        $and : [
            {
                ConversationID : convID,
            },
            {
                _id : id,
            }
        ]
    }).then((response)=>{
        res.status(200).json(response)
    }).catch((err)=>{
        res.status(500).json(err)
    })
}


module.exports = {
    sendMessage,
    getMessage,
    deleteMessage,
    unsendMessage,
}