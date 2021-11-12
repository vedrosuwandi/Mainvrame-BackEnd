//The User Model
const UserModel = require('../Models/UserModel');

//Hashing password Library
const bcrypt = require('bcryptjs');

//JSON Web Token Library
const jwt = require('jsonwebtoken');

//Register Function
const register = (req, res) =>{
    // To encrypt the password in request (req.body.Password)
    bcrypt.hash(req.body.Password , 10, (err, hashPass)=>{
        // If there is error show and error Message
        if(err) {
            res.json({
                error: err
            })
        }else {
            // Add User Data based on the input
            const User = new UserModel ({
                Name : req.body.Name,
                Username : req.body.Username,
                //take the hashed password
                Password : hashPass,
                Contact : {
                    Email : req.body.Email,
                    Phone : req.body.Phone,
                },
                Currency : 0
            })
        
            User.save()
            .then((user)=>{
                res.json({
                    success : "User Registered"
                })
            }).catch((error)=>{
                if("Username" in error.keyPattern){
                    res.json({
                        message : "Username is Taken!"
                    })
                }else if("Contact.Email" in error.keyPattern){
                    res.json({
                        message : "Email is Taken!"
                    })
                }else{
                    res.json({
                        message : "User Cannot Registered"  
                    })
                }
            })
        }
    })  
}

//Generate Access Token
const genAccessToken = (user)=>{
    return jwt.sign({Username : user.Username} , process.env.ACCESS_TOKEN_SECRET_KEY , {expiresIn : process.env.ACCESS_TOKEN_EXPIRES_IN} );
}
//Generate Refresh Token
const genRefreshToken = (user)=>{
    return jwt.sign({Username : user.Username}, process.env.REFRESH_TOKEN_SECRET_KEY , {expiresIn : process.env.REFRESH_TOKEN_EXPIRES_IN} );
}

//Login Function
const login = (req, res)=>{
    const username = req.body.Username;
    const password = req.body.Password;

    // Search for User in the database
    UserModel.findOne({
       Username : username
    },).then((user)=>{
        if(user){
            //Compare the password input and the encrypted password in the database
            bcrypt.compare(password , user.Password , (err, result)=>{
                if(err){
                    res.json({
                        auth : false,
                        error : err
                    })
                }else{
                     // if the password is match the token from jwt will be created by the username
                    if(result) {
                        //Users stores the token in the local machine for the time defined
                       //Generate Access Token
                       const token = genAccessToken(user);
                       //Generate Refresh Token
                       const refreshToken = genRefreshToken(user);
                        // send the data, auth and tokens
                        res.json({
                            auth : true,
                            token,
                            refreshToken,
                            user,
                            message : "User Log In"
                        })
                    }else{
                        // The password is incorrect
                        res.json({
                            auth : false,
                            message : "Incorrect Password"
                        })
                    }
                }
            })
        }else{
            res.json({
                auth : false,
                message : "User is not registered"
            })
        }
    })
}

// Refresh the token with the refresh token when the token is expired
const refresh = (req, res) =>{
    // get the token from the middleware
    const refreshToken = req.refreshToken;
    req.headers['Authorization'] = refreshToken;

    //Verify the refresh token to generate new token
    jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET_KEY , (err, decode)=>{
        if(err) {
            res.status(400).json({
                err,
                errMessage : "Refresh",
                message : "Refresh Token Expired"
            })
        }else{
            //Create new token that expires in the time set so the user does not log out before the refreshToken is expired
            const token = genAccessToken(decode);
            res.status(200).json({
                message : "Token Refreshed",
                token,
            })
        }
    })
}


module.exports = {
    register , login, refresh
}