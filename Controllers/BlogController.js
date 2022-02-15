const Blog = require('../Models/BlogModel');

// Post the Blog
const posts = (req, res) =>{
    const title = req.body.Title;
    const content = req.body.Content;
    const author = req.user.Username;

    const newBlog = new Blog({
        Title : title,
        Content : content,
        Author : author,
        CreatedAt : Date.now().toString(),
        UpdatedAt : Date.now().toString()
    })

    newBlog.save()
    .then((response)=>{
        res.status(200).json({
            message : "Blog Posted",
            log : `${author} posted blog on ${Date(response.CreatedAt)}`
        })
    }).catch((err)=>{
        res.status(500).json({
          message : err.message
        })
    })
}

// show the blog based on the username
const display = (req, res) =>{
    const username = req.params.username;

    Blog.aggregate([
        {
        $match : {
            Author : username
        }
    }]).then((response)=>{
        res.status(200).json({
            response
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

const deleteBlog = (req,res) =>{
    const id = req.params.id;
    const username = req.user.Username;

    Blog.deleteOne({
        $and : [
            {
                _id : id 
            },{
                Author : username
            }
        ]
   }).then((response)=>{
       if(response.deletedCount === 0){
           res.status(401).json({
               message: "Unauthorized"
           })
       }else{
           res.status(200).json({
               response,
               message : "Blog Deleted"
           })
       }
   }).catch((err)=>{
        res.status(500).json({
            err : err.message
        })
   })
    
}

const editBlog = (req, res) =>{
    const id = req.params.id;
    const title = req.body.Title;
    const content = req.body.Content;
    const username = req.user.Username;

    Blog.findOneAndUpdate({
        $and : [
            {
                _id : id
            },
            {
                Author : username
            }
        ]
    }, {
        $set : {
            Title : title,
            Content : content,
            UpdatedAt : Date.now().toString()
        }
    }, {new : 1}).then((response)=>{
        res.status(200).json({
            message : "Blog Updated",
            log : `${username} update Blog on ${Date(response.UpdatedAt)}`
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })

}

module.exports = {
    posts,
    display,
    deleteBlog,
    editBlog,
}