const Online = require('../Models/OnlineModel');
const User = require('../Models/UserModel');


/*Check if there is another user is login using the same account */
const checktoken = (req, res, next)=>{
    const username = req.user.Username;

    Online.findOne({
        Username : username
    }).then((response)=>{
        // the latest user login & convert the date to epoch
        const latest_epoch = Date.parse(response.RefreshToken.IssuedAt) / 1000;
        
        //Check if the user latest login time is match with the current user login time using the token
        if( latest_epoch !== req.user.iat){
            res.status(401).json({
                message : "Other User is LoggedIn",
                current_iat : new Date(req.user.iat * 1000).toString(),
                latest_iat : response.IssuedAt,
            })
        }else{
            res.status(200).json({
                message: "Continue",
                current_iat : new Date(req.user.iat * 1000).toString(),
                latest_iat : response.IssuedAt,
            })  
        }
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

// to check the user is online or not
const checkstatus = (req, res)=>{
    const username = req.params.username;

    Online.findOne({
        Username : username,
    }).then((response)=>{
        // check if the access token expired time is greater than now
        if(!response.Hidden){
            if(Date.parse(response.AccessToken.ExpiredAt) > Date.now()){
                res.status(200).json({
                    Online : true
                })
            }else{
                res.status(200).json({
                    Online : false
                })
            }
        }else{
            res.status(200).json({
                Online : "hidden"
            })
        }
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

/*Set the hidden status */
const sethidden = (req, res)=>{
    const username = req.params.username;
    const state = req.body.State;
    Online.findOneAndUpdate({
        Username : username
    },{
        $set : {
            Hidden : state
        }
    }).then((response)=>{
        res.status(200).json({
            message : "Changed"
        })
    }).catch((err)=>{
        res.status(500).json({
            message : err.message
        })
    })
}

/* Check if the user is hidden or not */
const checkhidden = (req, res)=>{
    const username = req.params.username;
    Online.findOne({
        Username : username
    },{Hidden : 1})
    .then((response)=>{
        res.json({
            Hidden : response.Hidden
        })
    }).catch((err)=>{
        res.json({
            msg : err.message
        })
    })
}


module.exports = {
    checktoken,
    checkstatus,

    checkhidden,
    sethidden
}