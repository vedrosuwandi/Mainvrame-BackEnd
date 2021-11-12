const jwt = require('jsonwebtoken');

const RefreshAuthenticate = (req, res, next) =>{
    try{
        const refreshToken = req.headers.authorization.split(' ')[1];
        //decode the secret in the token which is the identity of the token
        const decode = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET_KEY )

        req.refreshToken = refreshToken;
        req.user = decode;
        
        next();
        
    }catch(err){
        if(err.name == "TokenExpiredError"){
            res.status(401).json({
                err,
                message : "Refresh Token Expired"
            })
            return
        }
        res.json({
            err: err.message,
            message : "Authentication Failed!",
        })
    }
}

module.exports = RefreshAuthenticate