//The User Model
const UserModel = require('../Models/UserModel');

//Hashing password Library
const bcrypt = require('bcryptjs');

// Google OAuth Client
const {OAuth2Client} = require('google-auth-library');
//Facebook
const FB = require('fb');

// Random String
const randomstring = require('randomstring');

//JSON Web Token Library
const jwt = require('jsonwebtoken');

// Model
const Online = require('../Models/OnlineModel');
const User = require('../Models/UserModel');

const googleClient = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_API_KEY);

/**
 * 
 * AUTH
 * 
 */

//Login Function
const login = (req, res)=>{
    const username = req.body.Username;
    const password = req.body.Password;

    // Search for User in the database
    UserModel.findOne({
       Username : username
    },).then((user)=>{
        if(user){
            // Check if the user is verified
            if(!user.Verify){
                res.status(401).json({
                    user,
                    auth : false,
                    message : "User has not Verified!",
                })
            }else{
                //Compare the password input and the encrypted password in the database
                bcrypt.compare(password , user.Password , (err, result)=>{
                    if(err){
                        res.status(401).json({
                            auth : false,
                            error : err.message
                        })
                    }else{
                        // if the password is match the token from jwt will be created by the username
                        if(result) {
                        //Users stores the token in the local storage for the time defined
                            //Generate Access Token
                            const token = genAccessToken(user);
                            //Generate Refresh Token
                            const refreshToken = genRefreshToken(user);
                            // send the data, auth and tokens
                            res.status(200).json({
                                auth : true,
                                token,
                                refreshToken,
                                user,
                                message : "User Log In",
                            })

                        }else{
                            // The password is incorrect
                            res.status(401).json({
                                auth : false,
                                message : "Incorrect Password"
                            })
                        }
                    }
                })
            }
        }else{
            res.status(404).json({
                auth : false,
                message : "User is not registered"
            })
        }
    })
}

// Google Login 
const googleLogin = (req, res) =>{
    const tokenID = req.body.tokenID;
    
    // Tells Google Client to verify the Id token from the Front end
    googleClient.verifyIdToken({
        idToken : tokenID , 
        audience : process.env.GOOGLE_OAUTH_CLIENT_API_KEY
    }).then((response)=>{
        // if the verification in the google is true
        if(response.payload.email_verified) {
            UserModel.findOne({
                "Contact.Email" : response.payload.email
            }).then((user)=>{
                // if the user is exist
                if(user){
                    const token = genAccessToken(user);
                    //Generate Refresh Token
                    const refreshToken = genRefreshToken(user);
                    // send the data, auth and tokens
                    res.status(200).json({
                        auth : true,
                        token,
                        refreshToken,
                        user,
                        message : "User Log In",
                    })
                }else{
                    // if the user is not exist yet
                    let password = response.payload.email + randomstring.generate(12);
                    bcrypt.hash(password , 10, (err, hashPass)=>{
                        if(err){
                            res.status(400).json(err)
                        }else{
                            const User = new UserModel({
                                Name : response.payload.name,
                                Username : response.payload.name,
                                //take the hashed password
                                Password : hashPass,
                                Contact : {
                                    Email : response.payload.email,
                                },
                                Avatar : {
                                    GoogleAvatar : response.payload.picture,
                                },
                                Currency : Number("0"),
                                Verify : true,
                                CreatedAt : new Date()
                            })

                            User.save()
                            .then((user)=>{
                                const token = genAccessToken(user);
                                //Generate Refresh Token
                                const refreshToken = genRefreshToken(user);
                                // send the data, auth and tokens
                                res.status(200).json({
                                    auth : true,
                                    token,
                                    refreshToken,
                                    user,
                                    message : "User Log In",
                                })
                            }).catch((err)=>{
                               res.status(400).json(err)
                            })
                        }
                    })

                }
            }).catch((err)=>{
                res.status(400).json(err)
            })
        }
    })
}

//Facebook Login
const facebookLogin = (req, res) =>{
    const accessToken = req.body.AccessToken;
    const userID = req.body.userID;

    FB.api(
        userID,
        'GET',
        {"fields":"id,name,email","access_token":accessToken},
        function(response) {
            UserModel.findOne({
               "Contact.Email" : response.email
            }).then((user)=>{
                if(user){
                    const token = genAccessToken(user);
                    //Generate Refresh Token
                    const refreshToken = genRefreshToken(user);
                    // send the data, auth and tokens
                    res.status(200).json({
                        auth : true,
                        token,
                        refreshToken,
                        user,
                        message : "User Log In",
                    })
                }else{
                    // if the user is not exist yet
                    let password = response.email + randomstring.generate(12);
                    bcrypt.hash(password , 10, (err, hashPass)=>{
                        if(err){
                            res.status(400).json(err)
                        }else{
                            const User = new UserModel({
                                Name : response.name,
                                Username : response.name,
                                //take the hashed password
                                Password : hashPass,
                                Contact : {
                                    Email : response.email,
                                },
                                Currency : Number("0"),
                                Verify : true,
                                CreatedAt : new Date()
                            })

                            User.save()
                            .then((user)=>{
                                const token = genAccessToken(user);
                                //Generate Refresh Token
                                const refreshToken = genRefreshToken(user);
                                // send the data, auth and tokens
                                res.status(200).json({
                                    auth : true,
                                    token,
                                    refreshToken,
                                    user,
                                    message : "User Log In",
                                })
                            }).catch((err)=>{
                                res.status(400).json(err)
                            })
                        }
                    })
                }
            }).catch((err)=>{
                console.log(err)
               res.status(400).json(err)
            })
        }
    );

}

//Register Function
const register = (req, res) =>{
    // To encrypt the password in request (req.body.Password)
    bcrypt.hash(req.body.Password , 10, (err, hashPass)=>{
        // If there is error show and error Message
        if(err) {
            res.status(500).json({
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
                DOB : req.body.DOB,
                Currency : Number("0"),
                CreatedAt : new Date()
            })

            User.save()
            .then((user)=>{
                //Save the verification code
                res.status(200).json({
                    user,
                    success : "User Registered"
                })
                
            }).catch((error)=>{
                if(error.name === "ValidationError"){
                    res.status(422).json({
                        message : "Max length of Name is 16 char"
                    })
                }else{
                    if("Username" in error.keyPattern){
                        res.status(422).json({
                            message : "Username is Taken!"
                        })
                    }else if("Contact.Email" in error.keyPattern){
                        res.status(422).json({
                            message : "Email is Taken!"
                        })
                    }else{
                        res.status(422).json({
                            message : "User Cannot Registered"  
                        })
                    }
                }
            })
        }
    })  
}



/*
 * 
 * TOKEN
 *  
 */

//Generate Access Token
const genAccessToken = (user)=>{
    const accessToken =  jwt.sign({Username : user.Username} , process.env.ACCESS_TOKEN_SECRET_KEY , {expiresIn : process.env.ACCESS_TOKEN_EXPIRES_IN} );
    const decoded = jwt.decode(accessToken, {payload : true});

    // get the user data from token payload and retrieve the id
    User.findOne({
        Username : decoded.Username
    }, {Username : 1 , _id : 1})
    .then((response)=>{
        //Update Online Collection with the new payload of the token
        Online.findOneAndUpdate({
            UserID : response._id
        }, {
            Username : response.Username,
            "AccessToken.IssuedAt" : new Date(decoded.iat * 1000).toString(),
            "AccessToken.ExpiredAt" : new Date(decoded.exp * 1000).toString()
        },{
            upsert : true
        } ,(err, user)=>{
            if(err){
                console.log(err.message);
            }else{
                console.log(decoded.Username, "token Refreshed at" , new Date(decoded.iat * 1000).toString())
                // Date.parse("IssuedAt | ExpiredAt") to parse String to Date in Unix Epoch Second
                // console.log(decoded.exp * 1000);
            }
        })
    }).catch((err)=>{

    })

    return accessToken;
}
//Generate Refresh Token and store the payload into the online collection
const genRefreshToken = (user)=>{
    const refreshToken =  jwt.sign({Username : user.Username}, process.env.REFRESH_TOKEN_SECRET_KEY , {expiresIn : process.env.REFRESH_TOKEN_EXPIRES_IN} );
    const decoded = jwt.decode(refreshToken, {payload : true});

    // Add or Update the Online Collection to monitor the token issued and expired time
    User.findOne({
        Username : decoded.Username
    }, {Username : 1 , _id : 1})
    .then((response)=>{
        Online.findOneAndUpdate({
            UserID : response._id
        },{
            UserID : response._id,
            Username : response.Username,
            "RefreshToken.IssuedAt" : new Date(decoded.iat * 1000).toString(),
            "RefreshToken.ExpiredAt" : new Date(decoded.exp * 1000).toString()
        },{
            upsert : true
        }, (err, user)=>{
            if(err){
                console.log(err.message);
            }else{
                console.log(decoded.Username, "Logged-In at" , new Date(decoded.iat * 1000).toString())
                // Date.parse("IssuedAt | ExpiredAt") to parse String to Date in Unix Epoch Second
                // console.log(decoded.exp * 1000);
            }
        })
    }).catch((err)=>{
        console.log(err.message)
    })

    return refreshToken;
}

// Refresh the token with the refresh token when the token is expired
const refresh = (req, res) =>{
    // get the token from the middleware
    const refreshToken = req.refreshToken;
    req.headers['Authorizations'] = refreshToken;

    //Verify the refresh token to generate new token
    jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET_KEY , (err, decode)=>{
        if(err) {
            res.status(401).json({
                err,
                errMessage : "Refresh",
                message : "Refresh Token Expired"
            })
        }else{
            const token = genAccessToken(decode);

            //Create new token that expires in the time set so the user does not log out before the refreshToken is expired
            res.status(200).json({
                message : "Token Refreshed",
                token,
            })
        }
    })
}


module.exports = {
    /*Auth*/
    login, 
    register, 
    googleLogin,
    facebookLogin,
    
    /*Token*/
    genRefreshToken, 
    genAccessToken,
    refresh,
}