const express = require('express');
const router = express.Router();

const Authenticate = require('../Middleware/Authenticate');
const UploadImage = require('../Middleware/UploadImage');

const UserController = require('../Controllers/UserController');


// User (/user)
router.get('/index' , Authenticate, UserController.index);
router.get('/getuser' , Authenticate, UserController.getuser);
router.get('/getdetails/:username' , UserController.getuserdetails);
router.post('/changename' , Authenticate , UserController.changeName);
router.post('/changeusername' , Authenticate , UserController.changeUsername);
router.post('/changephone' , Authenticate , UserController.changePhone);
router.post('/changeemail' , Authenticate , UserController.changeEmail);
router.get('/getfriendstatus/:username' , Authenticate, UserController.getfriendstatus);
router.post('/checkemail' , UserController.checkemail);
router.get('/getID/:Name' , UserController.getID);

//Avatar
router.get('/getavatar/:id',  UserController.getavatar);
router.post('/deleteavatar/:id' , UserController.removeAvatar, UserController.unsetAvatar);
router.post('/uploadavatar/:id' , (req, res, next)=>{
    try{
        UploadImage.upload(req, res, (err)=>{
            if(!err){
                // stop the function if file.mimetype is not compatible
                if(req.error){
                    res.status(500).json({
                        message : req.error
                    })
                    return
                }
                next()
                // console.log(path.extname(req.file.originalname), '-' , req.file.mimetype)
            }else if(err.code === 'LIMIT_FILE_SIZE'){
                res.status(413).json({
                    message : "Max size is 1MB"
                })
            }else if(err){
               throw err
            }
        })
    }catch (err){
        console.log(err)
    }
}  , UserController.removeAvatar, UserController.uploadavatar);


//Banner Image
router.get('/getbanner/:id',  UserController.getbanner);
router.post('/deletebanner/:id' , UserController.removeBanner, UserController.unsetBanner);
router.post('/uploadbanner/:id' , (req, res, next)=>{
    try {
        UploadImage.uploadBanner(req, res, (err)=>{
            if(!err){
                // stop the function if file.mimetype is not compatible
                if(req.error){
                    res.status(500).json({
                        message : req.error
                    })
                    return
                }
                next()
            }else if(err.code === 'LIMIT_FILE_SIZE'){
                res.status(413).json({
                    message : "Max size is 16MB"
                })
            }else if(err){
                throw err
            }
        })
    } catch (err) {
        console.log(err)
    }
} ,UserController.removeBanner, UserController.uploadbanner)


//Email Verification
router.get('/getstatus/:id' , UserController.getVerifyStatus);

// Password
//Change Password
router.post('/changepass' , Authenticate, UserController.changePass);
//Reset Password
router.post('/sendlink' , UserController.resetLink);
router.post('/reset/:code' , UserController.resetPass);

//Currency
router.post('/topup/:Username' , Authenticate, UserController.topup);
router.post('/addpoint', Authenticate, UserController.addpoint , UserController.getcurrency);
router.post('/subtractpoint' , Authenticate , UserController.subtractpoint , UserController.getcurrency);
router.get('/getcurrency' , Authenticate , UserController.getcurrency);

//Friend
router.post('/addfriend/:id', Authenticate, UserController.addfriend);
router.post('/removepending/:id', Authenticate, UserController.removepending);
router.get('/getfriend/:id' , UserController.getfriend);
router.post('/sendrequest/:id' , Authenticate, UserController.sendFriendRequest );
router.get('/countrequest', Authenticate, UserController.countrequest);
router.post('/removefriend/:id', Authenticate , UserController.removefriend);


//Blacklist
router.get('/countblacklist' , Authenticate, UserController.countblacklist);
router.get('/countblacklisted' , Authenticate, UserController.countblacklisted);
router.get('/countblacklistfriend' , Authenticate, UserController.countblacklistfriend);
router.post('/blacklist' , Authenticate , UserController.blacklistfriend, UserController.blacklist );
router.post('/reverseblacklist' , Authenticate , UserController.reverseblacklistfriend, UserController.reverseblacklist);

router.post('/create' , Authenticate, UserController.create);
router.post('/update' , Authenticate, UserController.update);
router.post('/remove' , Authenticate, UserController.remove);


module.exports = router;