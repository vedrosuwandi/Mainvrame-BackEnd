const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    Author : {
        type : String,
        required : true
    },
    Title : {
        type : String,
        maxlength : 20,
        required : true
    },
    Content : {
        type : String,
        maxlength : 500,
        required : true,
    },
    CreatedAt : {
        type : String,
    },
    UpdatedAt : {
        type: String,
    }
}, {
    collection : "Blogs"
})

const Blog = new mongoose.model("Blog" , BlogSchema);

module.exports = Blog