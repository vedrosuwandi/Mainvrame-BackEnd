const express =require('express');
const router = express.Router()

const Authenticate = require('../Middleware/Authenticate');
const BlogController = require('../Controllers/BlogController'); 

router.get('/:username' , BlogController.display);
router.post('/posts' , Authenticate, BlogController.posts);
router.post('/edit/:id' , Authenticate, BlogController.editBlog);
router.delete('/delete/:id' ,Authenticate, BlogController.deleteBlog);




module.exports = router