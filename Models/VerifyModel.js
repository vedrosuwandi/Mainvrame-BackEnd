const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const VerifySchema = new Schema({
    CreatedAt : Date,
    Email : {
        type : String,
    },
    Code : {
        type : String,
        unique : true
    }
},{
    collection : "Verify",
});

VerifySchema.index({
    CreatedAt : 1
}, {expireAfterSeconds : 30})

const Verify = new mongoose.model("Verify" , VerifySchema);

module.exports = Verify