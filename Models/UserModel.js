const mongoose = require('mongoose');

//Create Schema
const Schema = mongoose.Schema;

//Schema Structure
const UserSchema = new Schema({
    Name : {
        type: String
    },
    Username : {
        type: String,
        unique : true
    },
    Password : {
        type : String
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
    Currency:{
        type : Number,
        min : 0
    }
},{
    collection : "User",
},
{timestamps: true});


//Define the Schema name with the schema
const User = new mongoose.model( 'User' , UserSchema);

module.exports = User;