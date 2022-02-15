const multer = require('multer');
const path = require('path');
const fs = require('fs');

require('dotenv').config()

const avatarStorage = multer.diskStorage({
    destination : (req, file , cb) =>{
        const path =  `Uploads/${req.params.id}`;
        fs.mkdirSync(path, { recursive: true })
        cb(null, path);
    },
    filename : (req, file, cb) =>{
        cb(null, req.params.id + '-avatar-' + Date.now() + '-' + file.originalname);   
    }
});

const bannerStorage = multer.diskStorage({
    destination : (req, file, cb) =>{
        const path =  `Uploads/${req.params.id}`;
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename : (req, file, cb) =>{
        cb(null, req.params.id + '-banner-' + Date.now() + '-' + file.originalname);
    }
})

const filefilter = (req, file, cb) =>{
    if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
        cb(null, true);
    }else{
        const error = "Only .png, .jpg and .jpeg format allowed!";
        req.error = error
        return cb(null, false, new Error(error));
        
    }
}

// Avatar
const upload = multer({
    storage : avatarStorage, 
    fileFilter : filefilter,
    limits: {
        fileSize : 1000 * 1000 // 1MB in bytes
    },
}).single('file')

//Banner
const uploadBanner =  multer({
    storage : bannerStorage,
    fileFilter : filefilter,
    limits : {
        fileSize : 1000 * 1000 * 16 // 16MB in bytes
    }
}).single('banner')


module.exports = {
    upload,
    uploadBanner
}