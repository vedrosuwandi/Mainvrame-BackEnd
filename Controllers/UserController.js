const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs');

//get all user
const index = (req, res) => {
    //db.collection.find()
    User.find({}).
    //then send the response in json format
    then((response)=>{
        res.json({
            response
        })
    }).catch((error)=>{
        res.json({
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
        res.json({
            response,
            message : "Data Added"
        });
    }).catch((err)=>{
        console.log(err.message);
        res.json({
            user : user,
            message: err.message
        })
    });
}

//Update
const update = (req, res, next) =>{
    let username = req.body.Username;

    let data = {
        Currency : req.body.Currency
    }

    User.findOneAndUpdate({Username : username} , {
        $set : data
    }).then((response)=>{
        res.json({
            response,
            message : "Data Updated"
        })
    }).catch((err)=>{
        res.json({
            username : username,
            data : data,
            message : "Update Failed"
        })
    })

}

//Change Password
const changePass = (req, res)=>{
    const username = req.body.Username;
    const password = req.body.Password;

    //Hash the new pass
    bcrypt.hash(password , 10 , (err, hashPass)=>{
        if(err){
            res.json({
                err
            })
        }else{
            // find user with the username and update the password
            User.findOneAndUpdate({Username : username} , {
                Password : hashPass
            }).then(()=>{
                res.json({
                    message : "Password Has been Changed"
                })
            }).catch((err)=>{
                res.json({
                    err,
                    message : "Password Does Not Change"
                })
            })
        }
    })
  
}


// Top Up Currency
const topup = (req, res, next) =>{
    const username = req.params.Username;
    const amount = req.body.Amount;

    User.findOneAndUpdate({Username : username} , {
        $inc : {
            'Currency' : amount
        }
    }).then((response)=>{
        res.json({
            message : "Data Updated"
        })
    }).catch((err)=>{
        res.json({
            message : "Update Failed"
        })
    })

}

//Show Specific User based on Username based on the token
const getuser = (req, res) =>{
    let Username = req.user.Username;
    User.findOne({Username : Username},{Password: 0}).then((mydata)=>{
        res.json({
            mydata,
        })
    }).catch((error)=>{
        res.json({
            message : "An Error Occured"
        })
    })
}

const remove = (req, res) =>{
    let username = req.body.Username;
    User.deleteOne({Username : username})
    .then((response)=>{
        if(response.deletedCount === 0){
            res.json({
                message : `There is no data with username ${username}`
            })
        }else{
            res.json({
                response,
            })
        }
    }).catch((error)=>{
        res.json({
            message : "Data Not Deleted"
        })
    })
}

// Show Specific using Query
const show_spec = (req, res) =>{
    const username = req.params.Username;
    User.findOne({Username : username}).then((response)=>{
        res.json({
            response
        })
    }).catch((error)=>{
        res.json({
            message : "An Error Occured"
        })
    })

}

module.exports = {
    index, 
    getuser, 
    create, 
    topup, 
    update,
    changePass, 
    show_spec, 
    remove
}