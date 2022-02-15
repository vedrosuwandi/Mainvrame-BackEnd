const mongoose = require('mongoose');

const OnlineSchema = new mongoose.Schema({
    UserID : {
        type : mongoose.Schema.Types.ObjectId,
        unique : true
    },
    Username : {
        type : String,
        unique : true
    },
    RefreshToken : {
        IssuedAt : {
            type : String,
        },
        ExpiredAt : {
            type : String
        },
    },
    AccessToken : {
        IssuedAt : {
            type : String,
        },
        ExpiredAt : {
            type : String
        },
    },
    Hidden : {
        type : Boolean,
        default : false
    }
   
}, {
    collection : "Online"
})

const Online = new mongoose.model('Online' , OnlineSchema);

module.exports = Online;