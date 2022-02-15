const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ResetPasswordSchema = new Schema({
    CreatedAt :{
        type : Date
    },
    Email : {
        type : String
    },
    Code : {
        type: String,
        unique : true
    }
},{
    collection : "ResetPassword"
})

ResetPasswordSchema.index({
    CreatedAt : 1
}, {
    expireAfterSeconds : 3600
})

const ResetPassword = new mongoose.model("ResetPassword" , ResetPasswordSchema);

module.exports = ResetPassword