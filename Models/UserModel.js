const mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;

//Create Schema
const Schema = mongoose.Schema;

//Schema Structure
const UserSchema = new Schema({
    Name : {
        type: String,
        required : true,
        maxlength: 16
    },
    Username : {
        type: String,
        unique : true,
        required : true,
    },
    Password : {
        type : String,
        required : true,
    },
    Contact : 
        {
            Email : {
                type : String,
                unique: true
            },
            Phone : {
                type : String
            }
        }
    ,
    DOB : {
        type : Date,
        required : true
    },
    Currency:{
        type : Long,
        min : 0
    },
    Verify : {
        type : Boolean,
        default : false
    },
    Avatar:{
        GoogleAvatar : {
            type : String,
        },
        Filename : {
            type : String,
        },
        Path : {
            type : String,
        },
        Size : {
            type : Number,
        }
    },
    Banner:{
        Filename :{
            type : String,
        },
        Path : {
            type : String,
        },
        Size : {
            type : Number,
        }
    },
    CreatedAt : {
        type : Date
    },
    Friends : {
        type : [
            {
                _id : {
                    type : Schema.Types.ObjectId,
                    unique : true
                },
                Blacklist : {
                    type : Boolean,
                    default : false
                } 
            }
        ],
        unique : true
    },
    PendingSent : {
        type : [
            {
                _id : {
                    type : Schema.Types.ObjectId,
                    unique : true
                } 
            }
        ],
        unique : true
    },
    PendingReceive : {
        type : [
            {
                _id : {
                    type : Schema.Types.ObjectId,
                } 
            }
        ],
        unique : true
    },
    Blacklist : {
        type : [
            {
                _id : {
                    type : Schema.Types.ObjectId,
                    unique : true
                },
            }
        ]
    },
    Blacklisted : {
        type : [
            {
                _id : {
                    type : Schema.Types.ObjectId,
                    unique : true
                },
            }
        ]
    }
},{
    collection : "User",
},
{timestamps: true});

//create index to delete the user that is not verified within a day
UserSchema.index({
     CreatedAt : 1
}, {
    expireAfterSeconds : 86400,
    partialFilterExpression : {
        Verify : false
    }
})


//Define the Schema name with the schema
const User = new mongoose.model( 'User' , UserSchema);

module.exports = User;