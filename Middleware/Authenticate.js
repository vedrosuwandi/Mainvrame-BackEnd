const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) =>{
    try{
        //Send the token with the bearer string in the header as auth key      
        const token = req.headers.authorization.split(' ')[1];
        //decode the secret in the token which is the identity of the token
        const decode = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET_KEY )
        
        //pass the user data to the next function
        req.user = decode
        // get the data from the decode
        // console.log(new Date(req.user.iat*1000).toString());
        // console.log(new Date(req.user.exp*1000).toString());
        next()

    }catch(err){
        if(err.name == "TokenExpiredError"){
            res.status(401).json({
                message : "Access Token Expired",
            })
            return
        }else{
            res.status(401).json({
                message : "Authentication Failed",
                msg: err.message
            })
        }
    }
}

module.exports = authenticate