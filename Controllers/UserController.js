const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const fs = require('fs');
const path = require('path');

const AuthController = require('../Controllers/AuthController');

const User = require('../Models/UserModel');
const Verify = require('../Models/VerifyModel');
const ResetPassword = require('../Models/ResetPasswordModel');

const sendEmail = require('../Mailer/Mailer');

require('dotenv').config()

/*
*
* USER
*
*/

//get all user
const index = (req, res) => {
    //db.collection.find()
    User.find({}).
    //then send the response in json format
    then((response)=>{
        res.status(200).json({
            response
        })
    }).catch((error)=>{
        res.status(500).json({
            error,
            message : "An Error Occured"
        })
    })
}

//Create document to User collection
const create = (req, res) =>{
    let user = new User({
        Name : req.body.FullName,
        Username : req.body.Username,
        Contact : {
            Email : req.body.Email,
            Phone : req.body.Phone
        },
        Currency : req.body.Currency
    });
    
    user.save().then((response)=>{
        res.status(200).json({
            response,
            message : "Data Added"
        });
    }).catch((err)=>{
        res.status(500).json({
            user : user,
            message: err.message
        })
    });
}

const update = (req, res, next) =>{
    let username = req.body.Username;
    
    let data = {
        Currency : req.body.Currency
    }
    
    User.findOneAndUpdate({Username : username} , {
        $set : data
    }).then((response)=>{
        res.status(200).json({
            response,
            message : "Data Updated"
        })
    }).catch((err)=>{
        res.status(500).json({
            username : username,
            data : data,
            message : "Update Failed"
        })
    })
    
}

const remove = (req, res) =>{
    let username = req.body.Username;
    User.deleteOne({Username : username})
    .then((response)=>{
        if(response.deletedCount === 0){
            res.status(404).json({
                message : `There is no data with username ${username}`
            })
        }else{
            res.status(200).json({
                response,
            })
        }
    }).catch((error)=>{
        res.status(400).json({
            message : "Data Not Deleted"
        })
    })
}

/**
 * 
 * PROFILE
 * 
 */

//Show Specific User based on Username based on the token
const getuser = (req, res) =>{
    // get the username from the token
    let Username = req.user.Username;
    // find the user based on the username from database
    User.findOne({Username : Username},{Password: 0})
    .then((mydata)=>{
        res.status(200).json({
            mydata,
        })
    }).catch((error)=>{
        res.status(500).json({
            error,
            message : "An Error Occured"
        })
    })
}

// get another user details
const getuserdetails = (req, res) =>{
    let username = req.params.username;
    User.findOne(
        {Username : username},
        {
           Password : 0,
           Currency : 0,
           Verify : 0,
           Contact : 0
        })
    .then((data)=>{
        res.status(200).json({
            data,
        })
    }).catch((error)=>{
        res.status(500).json({
            error,
            message : "An Error Occured"
        })
    })
}

// get userID
const getID = (req, res) =>{
    const name = req.params.Name;
    User.find({
        Name : {
            $regex : new RegExp("^" + name,"i")
        }
    }, {
        _id : 1
    }).then((response)=>{
        res.status(200).json(response)
    }).catch((err)=>{
        res.json({
            message : err.message
        })
    })
}

/**
 * 
 *  PROFILE
 * 
 */

/**
 *  NAME
 */
const changeName = (req, res) =>{
    const username = req.user.Username;
    const name = req.body.Name;

    if(name.length > 16){
        res.status(422).json({
            message : "Max Length is 16 char"
        })
    }else{
        User.findOneAndUpdate({
            Username : username
        }, {
            $set : {
                Name : name
            }
        }).then((response)=>{
            res.status(200).json({
                message : "Name is Changed to " + name
            })
        }).catch((err)=>{
            res.status(500).json({
                message : err.message
            })
        })
    }

}

/**
 *  USERNAME
 */
const changeUsername = (req,res)  =>{
    const username = req.user.Username;
    const newUsername = req.body.Username;

    // Check if the new username is exists in the database
    User.where({
        Username : newUsername
    }).count()
    .then((response)=>{
        if(response === 1){
            res.status(409).json({
                message : "Username is already exists"
            })
        }else{
            User.findOneAndUpdate({
                Username : username
            }, {
                $set : {
                    Username : newUsername
                }
            }, {new : true}).then((response)=>{
                const newRefresh = AuthController.genRefreshToken(response);
                const newAccess = AuthController.genAccessToken(response);
                res.status(200).json({
                    newRefresh,
                    newAccess,
                    message : "Username Changed to " + newUsername
                })
                console.log(username + " has changed name into " + newUsername)
            }).catch((err)=>{
                res.status(500).json({
                    msg : err.message
                })
            })
        }
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

/**
 *  PHONE
 */

const changePhone = (req, res) =>{
    const username = req.user.Username;
    const phone = req.body.Phone;

    User.where({
        "Contact.Phone" : phone
    }).count()
    .then((response)=>{
        if(response >= 1){
            res.status(409).json({
                message : "This Phone Number is already Registered"
            })
        }else{
            User.findOneAndUpdate({
                Username : username
            }, {
                $set : {
                    "Contact.Phone" : phone 
                }
            }).then((response)=>{
                res.status(200).json({
                    message : "Phone is Changed to " + phone
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

/**
 *  EMAIL
 */


//Check Email whether they are exist or not
const checkemail = (req, res) =>{
    const email = req.body.Email
    
    User.find({
        "Contact.Email" : email
    }, {limit : 1}).count()
    .then((exists)=>{
        res.json({
            exists : Boolean(exists)
        })    
    }).catch((err)=>{
        res.status(400).json({
            message : err.message
        })
    })
}


const changeEmail = (req, res) =>{
    const username = req.user.Username;
    const email = req.body.Email;
    const code = req.body.Code;
    
    Verify.findOne({
        $and : [
            {
                Email : email,
            },
            {
                Code : code
            }
        ]
    }).count()
    .then((exists)=>{
        if(!Boolean(exists)){
            res.status(401).json({
                success : false,
                message : "Incorrect Code"
            })
        }else{
            User.findOneAndUpdate({
                Username : username
            }, {
                $set:{
                    "Contact.Email" : email
                }
            }).then((response)=>{
                res.status(200).json({
                    success : true,
                    message : "Email has been changed to " + email
                })
            })
        }
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })

}



/**
 * 
 * Password
 * 
 */

//Check email to reset the password
const resetLink = (req, res)=>{
    const email = req.body.Email;

    User.findOne({
        $and:[
            {
                "Contact.Email" : email
            },
            {
                Verify : true
            }
        ]
    }).then((user)=>{
        if(!user){
            res.status(404).json({
                message : "No User found"
            })
        }else{
            //Generate Reset Password Link
            const resetPassword = new ResetPassword({
                CreatedAt : new Date(),
                Email : email,
                Code : randomstring.generate()
            });

            resetPassword.save()
            .then((ResetPassword)=>{
                //Send the email
                sendEmail.forgotPassword(email , `${process.env.RESET_PASSWORD_LINK}${ResetPassword.Code}`);
                res.status(200).json({
                    message : "Email Sent"
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

//Change Password
const changePass = (req, res)=>{
    const password = req.body.Password;
    const oldPassword = req.body.OldPassword;
    
    //find the user to compare the password
    User.findOne({
        Username : req.user.Username
    }).then((response)=>{
        bcrypt.compare(oldPassword , response.Password , (err, success)=>{
            if(err){
                res.status(500).json({
                    err : err.message,
                })
            }else{
                if(!success){
                    res.status(401).json({
                        message : "Incorrect Password"
                    });
                }else{
                    bcrypt.hash(password, 10, (err, hashPass)=>{
                        if(err){
                            res.status(500).json({
                                err : err.message
                            })
                        }else{
                            // Change the Password
                            User.findOneAndUpdate({
                                Username : req.user.Username
                            }, {
                                Password : hashPass
                            }).then((response)=>{
                                res.status(200).json({
                                    changed : true,
                                    message : "Password Changed"
                                })
                            }).catch((err)=>{
                                res.status(500).json({
                                    message : err.message
                                })
                            })
                        }
                    })
                }
            }
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
    
    
}

//Reset Password
const resetPass =  (req, res)=>{
    const code = req.params.code;
    const password = req.body.Password;
    
    // Hash the new pass
    bcrypt.hash(password , 10 , (err, hashPass)=>{
        if(err){
            res.status(500).json({
                msg: err.message
            })
        }else{
            // find the user and update the hashed password
            ResetPassword.findOne({
                Code : code
            },{Email : 1})
            .then((response)=>{
                User.findOneAndUpdate({
                    "Contact.Email" : response.Email
                }, {
                    Password : hashPass
                }).then((response)=>{
                    res.status(200).json({
                        message : "Password has been reset"
                    })
                }).catch((err)=>{
                    res.status(500).json({
                        message : err.message
                    })
                })   
            }).catch((err)=>{
                res.status(500).json({
                    msg : err.message
                })
            })
        }
    })
}
   

/**
 * 
 * Friends
 * 
 */

/* Get friend data from the id in the friends array */
const getfriend = (req, res)=>{
    const id = req.params.id
    
    User.findOne({
        _id : id
    }, {
        Password : 0
    }).then((response)=>{
        res.status(200).json({
            response
        })

    }).catch((err)=>{
        res.status(500).json({
            err: err.message
        })
    })
}

// find if the user is friend or not
const getfriendstatus = (req,res) =>{
    const username = req.params.username;
    const user = req.user.Username;

    if(username === user){
        res.status(200).json({
            self : 1
        })
    }else{

        User.findOne({
            Username : user
        },{
            _id : 1
        }).then((response)=>{
            User.findOne({
                Username : username,
                $or : [
                    {
                        Friends : {
                            $elemMatch  :{
                                _id : response._id
                            }
                        } 
                    },
                    {
                        PendingReceive : {
                            $elemMatch  : {
                                _id : response._id
                            }
                        }
                    },
                    {
                        Blacklist : {
                            $elemMatch  :{
                                _id : response._id
                            }
                        }
                    },
                    {
                        Blacklisted : {
                            $elemMatch  :{
                                _id : response._id
                            }
                        }
                    },
                ]
            }, {
                Friends : {
                    $elemMatch : {
                        _id : response._id
                    }
                },
                PendingReceive : {
                    $elemMatch  :{
                        _id : response._id
                    }
                },
                Blacklist : {
                    $elemMatch  :{
                        _id : response._id
                    }
                },
                Blacklisted : {
                    $elemMatch  :{
                        _id : response._id
                    }
                }
            }).then((response)=>{
                res.status(200).json({
                    self : 0,
                    Friends : response.Friends.length,
                    PendingReceive :  response.PendingReceive.length,
                    Blacklist :  response.Blacklist.length,
                    Blacklisted :  response.Blacklisted.length,
                })
            }).catch((err)=>{
                res.status(200).json({
                    self : 0,
                    Friends : 0, 
                    PendingReceive : 0,
                    Blacklist : 0,
                    Blacklisted : 0,
                })
            })
        }).catch((err)=>{
            res.status(500).json({
               msg : err.message
            })
        })
    }

}

// Show Get Verification Status from Email
const getVerifyStatus = (req, res) =>{
    const id = req.params.id;
    User.find({
        _id : id
    }, {Verify : 1})
    .then((user)=>{
        res.status(200).json({
            user,
            message : "Data Retrieved"
        })
    }).catch((err)=>{
        res.status(500).json({
            msg : err.message
        })
    })
}

// Count how many friend request
const countrequest = (req, res)=>{
    const username = req.user.Username;
    
    User.aggregate([
        {
            $match : {
                Username : username
            }
        }, {
            $project : {
                count : {
                    $size : { 
                        $ifNull: [ "$PendingReceive", [] ] 
                    }
                }
            }
        }
    ]).then((response)=>{
        res.status(200).json({
            count : response[0].count
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

// friend request function
const sendFriendRequest = (req,res,next)=>{
    const friendID = req.params.id;
    req.body.id = friendID;
    const username = req.user.Username;

    User.findOne({
        Username : username,
        "Friends._id" : {
            $eq : friendID
        }
    }, {Friends : 1})
    .then((response)=>{  
        // Check if the user is a friend or not
    
        if(response){
            res.status(403).json({
                message : "User is Already A Friend",
                response
            })
        }else{ 
            // Add friend ID to the PendingSent
            User.findOneAndUpdate({
                Username : username
            }, {
                $addToSet : {
                    PendingSent : {
                        _id : friendID
                    }
                }
            }, {upsert : 1})
            .then((response)=>{
                // Add ID to friend's PendingReceive
                User.findOneAndUpdate({
                    _id : friendID
                }, {
                    $addToSet : {
                        PendingReceive : {
                            _id : response._id
                            }
                        }
                }, {upsert : 1}).then((response)=>{
                    res.status(200).json({
                        message : "Friend Request Sent"
                    })
                }).catch((err)=>{
                    res.status(500).json({
                        message : err.message
                    })
                })
            }).catch((err)=>{
                res.status(500).json({
                    message : err.message
                })
            })
        }
        
    }).catch((err)=>{
        res.status(500).json({
            msg : err.message
        })
    })
}

// add friend 
const addfriend = (req, res) =>{
    const id = req.params.id;
    req.body.id = id;
    const username = req.user.Username;
    // update friend to my friend list
    User.findOneAndUpdate({
        Username : username
    }, {
        $addToSet : {
            Friends : {
                _id : id
            }
        }
    },{
        upsert : 1
    })
    .then((response)=>{
        // add my id to friend's id
        User.findOneAndUpdate({
            _id : id
        }, {
            $addToSet : {
                Friends : {
                    _id : response._id
                }
            }
        }).then((response)=>{
            // Friend Added and remove the pending status
            User.findOneAndUpdate({
                Username : username
            },{
                $pull : {
                    PendingReceive : {
                        _id : id
                    }
                }
            }).then((response)=>{
                // Remove the pending sent from (friend) friend request
                User.findOneAndUpdate({
                    _id : id
                }, {
                    $pull : {
                        PendingSent : {
                            _id : response._id
                        }
                    }
                }).then((response)=>{
                    res.status(200).json({
                        message : response.Name + " Added"
                    })
                }).catch((err)=>{
                    res.status(500).json({
                        msg : err.message
                    })
                })
            }).catch((err)=>{
                res.status(500).json({
                    msg : err.message
                })
            })
        }).catch((err)=>{
            res.status(500).json({
                err : err.message
            })
        })
    }).catch((err)=>{
        res.status(500).json({
            err : err.message
        })
    })
}

// Remove the pending from user and friend 
const removepending = (req, res)=>{
    const id = req.params.id;
    req.body.id = id;
    const username = req.user.Username;

    // Remove the pending Receive from user friend request
    User.findOneAndUpdate({
        Username : username
    },{
        $pull : {
            PendingReceive : {
                _id : id
            }
        }
    }).then((response)=>{
        // Remove the pending snet from friend friend request
        User.findOneAndUpdate({
            _id : id
        }, {
            $pull : {
                PendingSent : {
                    _id : response._id
                }
            }
        }).then((response)=>{
            res.status(200).json({
                message : "Rejected"
            })
        }).catch((err)=>{
            res.status(500).json({
                msg : err.message
            })
        })
    }).catch((err)=>{
        res.status(500).json({
            msg : err.message
        })
    })
}

/* Delete friend */
const removefriend = (req, res) =>{
    const id = req.params.id;
    req.body.id = id;
    const username = req.user.Username;
    User.findOneAndUpdate({
        Username : username
    }, {
        $pull : {
            Friends : {
                _id : id
            }
        }
    }).then((response)=>{
        User.findOneAndUpdate({
            _id : id
        }, {
            $pull : {
                Friends : {
                    _id : response._id
                }
            }
        }).then((response)=>{
            res.status(200).json({
                message : response.Name + " is Removed from your Friend List"
            })
        }).catch((err)=>{
            res.status(500).json({
                msg : err.message
            })
        })
    }).catch((err)=>{
        res.status(500).json({
            msg : err.message
        })
    })
}



/**
 * 
 * Blacklist
 * 
 */

/*Blacklist user*/
const blacklist = (req,res) =>{
    const username = req.user.Username;
    const id = req.body.ID;

    // Add the Id of my user to the blacklist
    User.findOneAndUpdate({
        Username : username
    }, {
        $addToSet : {
            Blacklist : {
                _id : id
            }
        }
    }, {
        upsert : true,
    }).then((response)=>{
        // Add the id of the user to the blacklisted
        User.findOneAndUpdate({
            _id : id
        }, {
            $addToSet : {
                Blacklisted : {
                    _id : response._id
                }
            }
        }, {
            upsert : 1,
            new : true
        }).then((response)=>{
            res.status(200).json({
                message : response.Name + " has been Blacklisted"
            })
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

/* Blacklist friend */
const blacklistfriend = (req, res, next) =>{
    const username = req.user.Username;
    const id = req.body.ID;

    User.findOneAndUpdate({
        $and : [
            {
                Username : username
            },
            {
                "Friends._id" : id
            }
        ]
    },{
        $set : {
            "Friends.$.Blacklist" : true
    }}, {new : true}).then((response)=>{
       User.findOne({
           _id : id
       }, {Name : 1})
       .then((response)=>{
            next()
       }).catch((err)=>{
           res.status(500).json({
               message : err.message
           })
       })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

/*Reverse Blacklist (Unblock) */
const reverseblacklist = (req, res)=>{
    const username = req.user.Username;
    const id = req.body.ID;

    User.findOneAndUpdate({
        Username : username
    }, {
        $pull : {
            Blacklist : {
                _id : id
            }
        }   
    }).then((response)=>{
        User.findOneAndUpdate({
            _id : id
        }, {
            $pull : {
                Blacklisted : {
                    _id : response._id
                }
            }
        }).then((response)=>{
            res.status(200).json({
                message : response.Name + " has not Blacklisted"
            })
        }).catch((err)=>{
            res.status(500).json({
                message : err.message
            })
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

/* Reverse Blacklist Function */
const reverseblacklistfriend = (req, res, next) =>{
    const username = req.user.Username;
    const id = req.body.ID;

    User.findOneAndUpdate({
        $and : [
            {
                Username : username
            },
            {
                "Friends._id" : id
            }
        ]
    },{
        $set : {
            "Friends.$.Blacklist" : false
    }}, {new : true}).then((response)=>{
        User.findOne({
            _id : id
        }, {Name : 1})
        .then((response)=>{
            next();
        }).catch((err)=>{
            res.status(500).json({
                message : err.message
            })
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}


/* Count how many blacklist user has */
const countblacklist = (req, res) =>{
    const username = req.user.Username;
    
    User.aggregate([
        {
            $match : {
                Username : username
            }
        }, {
            $project : {
                count : {
                    $size : { 
                        $ifNull: [ "$Blacklist", [] ] 
                    }
                }
            }
        }
    ]).then((response)=>{
        res.status(200).json({
            count : response[0].count
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

const countblacklistfriend = (req, res) =>{
    const username = req.user.Username;
    
    User.aggregate([
        {
            $match : {
                Username : username
            }
        }, {
            $project : {
                count : {
                    $size : { 
                        $filter : {
                            "input": "$Friends",
                            "cond": { "$eq": [ "$$this.Blacklist", true ] }
                        }
                    }
                }
            }
        }
    ]).then((response)=>{
        res.status(200).json({
            count : response[0].count
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

const countblacklisted = (req, res) =>{
    const username = req.user.Username;
    
    User.aggregate([
        {
            $match : {
                Username : username
            }
        }, {
            $project : {
                count : {
                    $size : { 
                        $ifNull: [ "$Blacklisted", [] ] 
                    }
                }
            }
        }
    ]).then((response)=>{
        res.status(200).json({
            count : response[0].count
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}
 

/**
 * 
 * CURRENCY
 * 
 */


//get Currency
const getcurrency = (req, res)=>{
    User.findOne({Username : req.user.Username},{Currency : 1})
    .then((user)=>{
        var value;
        if( user.Currency.low < 0){
            value =  user.Currency.high * Math.pow(2 , 32) +  user.Currency.low + Math.pow(2 , 32)
        }else{
            value =  user.Currency.high * Math.pow(2 , 32) +  user.Currency.low
        }

        res.status(200).json({
            user,
            currency : value
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

// Top Up Currency
const topup = (req, res, next) =>{
    const id = req.params.id;
    const amount = req.body.Amount;
    
    User.findOneAndUpdate({_id : id} , {
        $inc : {
            'Currency' : amount
        }
    }).then((response)=>{
        res.status(200).json({
            message : "Data Updated"
        })
    }).catch((err)=>{
        res.status(500).json({
            err : err.message,
            message : "Update Failed"
        })
    })
    
}

// Get Point
const addpoint = (req, res, next) =>{
        const amount = req.body.Amount;
        
        User.findOneAndUpdate({
            Username : req.user.Username
    },{
        $inc :
        {
            Currency : amount
        }
    }).then((response)=>{
        next();
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

// subtract point
const subtractpoint = (req, res, next) =>{
    const amount = req.body.Amount
    
    User.findOneAndUpdate({
        Username : req.user.Username
    }, {
        $inc : {
            Currency : -amount
        }
    }).then((response)=>{
        next();
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}


/**
 * 
 *AVATAR IMAGE
 *
 */

/* Get Avatar Image*/
const getavatar = (req, res) =>{
    const id  = req.params.id;
    // console.log(id)
    User.findOne({
        _id : id,
    },{
        Password : 0
    }).then((response)=>{
        if(response.Avatar.Filename === "" || !response.Avatar.Filename){
            fs.readFile(path.join(__dirname , `../Uploads/DefaultAvatar/avatar.png`), (err,data)=>{
                if(err){
                    console.log(err)
                }
                res.writeHead(200, {
                    'Content-Type' : 'image/jpeg' || 'image/png' || 'image/jpg'
                })
                res.end(data)
            
            })

        }else{
            fs.readFile(path.join(__dirname , `../Uploads/${response._id}/${response.Avatar.Filename}`), (err,data)=>{
                if(err){
                    console.log(err)
                }
                res.writeHead(200, {
                    'Content-Type' : 'image/jpeg' || 'image/png' || 'image/jpg'
                })
                res.end(data)
            
            })
        }
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

//Upload Avatar Image
const uploadavatar = (req,res, next) =>{
    const id = req.params.id
    
    if(!req.file){
        res.status(404).json({
            message : "Select a File"
        })
        return
    }else{
        // if there is more than 8MB or 8000 bytes
        User.findOneAndUpdate({
            _id : id
        }, {
            "Avatar.Filename" : req.file.filename,
            "Avatar.Path" : req.file.path,
            "Avatar.Size" : req.file.size,
            $unset : {
                "Avatar.GoogleAvatar" : ""
            }
        }, {
            upsert : 1
        }).then((response)=>{
            res.status(200).json({
                file : req.file,
                message : "Avatar Image Changed"
            })
            
        }).catch((err)=>{
            res.status(500).json({
                message : err.message
            })
        })
    }
}

// remove the old avatar image from the Upload Folder
const removeAvatar = (req, res, next) =>{
    const id = req.params.id

    User.findOne({
        _id : id,
        // if the Avatar field is exist
        Avatar : {
            $exists : true
        }
    }, {
        _id : 1,
        Avatar : 1,
    }).then((response)=>{
        // if the user is null then next go to the next function
        if(!response){
            return next()
        }else{    
            // delete the old Avatar image from the Upload folder
            fs.unlink(path.join(__dirname , `../Uploads/${response._id}/${response.Avatar.Filename}`), (err)=>{
                if(err){
                    console.log(err);
                }

            })
            return next()
        }
    }).catch((err)=>{
        // if the error is not passing the $exists
        res.status(404).json({
            msg : err.message,
            message : "User is not exist"
        })

    })
}

// remove the avatar path from the database
const unsetAvatar = (req, res)=>{
    const id = req.params.id 

    User.findOneAndUpdate({
        _id : id
    }, {
      $unset : {
        Avatar : 1
    }
    }).then((response)=>{
        res.status(200).json({
            response
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}


/*
 * 
 * Banner Image 
 * 
 */

/* Get Banner Image*/
const getbanner = (req, res) =>{
    const id  = req.params.id;

    User.findOne({
        _id : id,
    },{
        Password : 0
    }).then((response)=>{
        if(response.Banner.Filename === "" || !response.Banner.Filename){
            fs.readFile(path.join(__dirname , `../Uploads/DefaultAvatar/grey.jpg`), (err,data)=>{
                if(err){
                    console.log(err)
                }
                res.writeHead(200, {
                    'Content-Type' : 'image/jpeg' || 'image/png' || 'image/jpg'
                })
                res.end(data)
                
            })
            
        }else{
            fs.readFile(path.join(__dirname , `../Uploads/${response._id}/${response.Banner.Filename}`), (err,data)=>{
                if(err){
                    console.log(err)
                }
                res.writeHead(200, {
                    'Content-Type' : 'image/jpeg' || 'image/png' || 'image/jpg'
                })
                res.end(data)
            
            })
        }
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

//Upload Banner Image
const uploadbanner = (req,res, next)=>{
    const id = req.params.id

    if(!req.file){
        res.status(404).json({
            message : "Select a File"
        })
        return
    }else{
        // if there is more than 8MB or 8000 bytes
        User.findOneAndUpdate({
            _id : id
        }, {
            "Banner.Filename" : req.file.filename,
            "Banner.Path" : req.file.path,
            "Banner.Size" : req.file.size
        }, {
            upsert : 1
        }).then((response)=>{
            res.status(200).json({
                file : req.file,
                message : "Banner Image has been changed"
            })
            
        }).catch((err)=>{
            res.status(500).json({
                message : err.message
            })
        })
    }
}

// remove the old banner image from the Upload Folder
const removeBanner = (req,res,next) =>{
    const id = req.params.id;
    
    User.findOne({
        _id : id,
        Banner : {
            $exists : true
        }
    }, {
        _id : 1,
        Banner : 1
    }).then((response)=>{
        if(!response){
            return next()
        }else{    
            // delete the old Avatar image from the Upload folder
            fs.unlink(path.join(__dirname , `../Uploads/${response._id}/${response.Banner.Filename}`), (err)=>{
                if(err){
                    console.log(err);
                }
            })
            return next()
        }
    }).catch((err)=>{
        res.status(404).json({
            msg : err.message,
            message : "User is not exist"
        })
    })
}

// remove the banner path from the database
const unsetBanner = (req,res)=>{
    const id = req.params.id 

    User.findOneAndUpdate({
        _id : id
    }, {
      $unset : {
        Banner : 1
    }
    }).then((response)=>{
        res.status(200).json({
            response
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}




module.exports = {
    /*User*/
    index, 
    create, 
    update, 
    remove,

    /*User Details*/
    getuser,
    getuserdetails,
    getVerifyStatus,
    getID,

    /*Name*/
    changeName,

    /*Username*/
    changeUsername,

    /*Email*/
    checkemail,
    changeEmail,    

    /*Phone*/
    changePhone,

    /*Friends*/
    getfriend,
    getfriendstatus,
    countrequest,
    addfriend,
    sendFriendRequest,
    removepending,
    removefriend,

    
    /*Blacklist*/
    blacklist,
    blacklistfriend,
    reverseblacklist,
    reverseblacklistfriend,
    countblacklist,
    countblacklistfriend,
    countblacklisted,

    /*Password*/
    resetLink,
    resetPass,
    changePass,  

    /*Currency */
    getcurrency,
    topup, 
    addpoint,
    subtractpoint,

    /*Avatar*/
    getavatar,
    uploadavatar,
    removeAvatar,
    unsetAvatar,

    /*Banner*/
    getbanner,
    uploadbanner,
    removeBanner,
    unsetBanner,

}