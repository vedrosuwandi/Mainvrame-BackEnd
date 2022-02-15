//Random string for Verification code
const randomstring = require('randomstring');

const UserModel = require('../Models/UserModel');
const VerifyModel = require('../Models/VerifyModel');

const sendEmail = require('../Mailer/Mailer');


const getVerificationData = (req,res)=>{
    const id = req.params.id;
    
    UserModel.find({
        $and : [
            {
                _id : id
            }, {
                Verify : false
            }
        ]
    },{ "Contact.Email" : 1}).then((user)=>{
        res.status(200).json({
            user
        })
    }).catch((err)=>{
        res.status(500).json({
            err,
            message : err.message
        })
    })   
}


//Send the code
const sendLink = (req, res)=>{
    const id = req.params.id

    // find the user based on Id and status is false
    UserModel.find({
        $and : [
            {
                _id : id
            },
            {
                Verify : false
            }
        ]
    }).then((user)=>{
       
        const Verify = new VerifyModel({
            CreatedAt : new Date(),
            Email : user[0].Contact.Email,
            Code : randomstring.generate()
        })
        
        Verify.save()
        .then((verify)=>{
            //Send Email
            sendEmail.sendVerify(verify.Email , `${process.env.VERIFICATION_LINK}${verify.Code}`)
            // Notify if the email is sent
            res.status(200).json({
                success : "Code has been Sent",
                code : verify.Code
            })
        }).catch((err)=>{
            res.status(500).json({
                err,
                message : err.message
            })
        })

    }).catch((err)=>{
        res.status(500).json({
            err,
            message : err.message
        })
    })   
}


// update the verify state in user collection
const verifyAccount = (req, res)=>{
    const code = req.params.code;
    
    // find the email with the same verification code
    VerifyModel.findOne({
        Code : code
    }).then((response)=>{
        if(!response){
            res.status(401).json({
                response,
                message : "Code Expired"
            })
        }else{
            UserModel.findOneAndUpdate({
                $and : [
                    {
                        "Contact.Email" : response.Email
                    },
                    {
                        Verify : false
                    }
                ]
            },{
                Verify : true   
            }).then((response)=>{
                res.status(200).json({
                    message: "Account Verified"
                })
            }).catch((err)=>{
                res.status(500).json({
                    message : err.message
                })
            })
        }
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

const genChangeEmailCode = (req, res) => {
    const email = req.body.Email;
    const Verify = new VerifyModel({
        CreatedAt : new Date(),
        Email : email,
        Code : Math.floor(100000 + Math.random() * 900000)
    })

    Verify.save()
    .then((response)=>{
        sendEmail.changeEmail(response.Email , response.Code);
        res.status(200).json({
            email : response.Email,
            code : response.Code
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}


module.exports = {
    sendLink, 
    getVerificationData, 
    verifyAccount,
    genChangeEmailCode,
}