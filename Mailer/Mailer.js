require('dotenv').config();

const nodemailer = require('nodemailer');
const nodemailgun = require('nodemailer-mailgun-transport');
const hbs = require('handlebars');

const auth = {
    auth : {
        api_key : process.env.MAILGUN_API_KEY,
        domain : process.env.MAILGUN_DOMAIN
    }
}


const transport = nodemailer.createTransport(nodemailgun(auth));

const sendVerify = (to, link)=>{
    // Send the email
    transport.sendMail({
        from : 'OmniVR Metaverse <vedromnivr@gmail.com>',
        to : to,
        subject : "Email Verification",
        template : {
            // Get the template engine file (path)
            name : "./Mailer/Template/VerifyEmail.handlebars",
            engine : 'handlebars',
            // pass the variable from the parameter to the template
            context : {
                link : link
            }
        },
        // text : `Please Verify Your Email ${link}`,
    
    } , (err, data)=>{
        if(err){
            console.log(err);

        }else{
            //Email is successfully sent
            console.log("Verification Link Sent");
        }
    })
}

const forgotPassword = (to, link)=>{
    transport.sendMail({
        from : 'OmniVR Metaverse <vedromnivr@gmail.com>',
        to : to,
        subject : "New Email Confirmation",
        template : {
            // Get the template engine file (path)
            name : "./Mailer/Template/ForgotPassword.handlebars",
            engine : 'handlebars',
            // pass the variable from the parameter to the template
            context : {
                link : link
            }
        },
        // text : `Please Verify Your Email ${link}`,
    
    } , (err, data)=>{
        if(err){
            console.log(err);

        }else{
            //Email is successfully sent
            console.log("Reset Password Link Sent");
        }
    })
}


const changeEmail = (to, code) =>{
    transport.sendMail({
        from : 'OmniVR Metaverse <vedromnivr@gmail.com>',
        to : to,
        subject : "Change Email Confirmation",
        template : {
            name : "./Mailer/Template/ChangeEmail.handlebars",
            engine : "handlebars",
            context : {
                Code : code
            }
        }
    }, (err, data)=>{
        if(err){
            console.log(err);
        }else{
            //Email is successfully sent
            console.log("Change Email Code Sent");
        }
    })
}

module.exports = {
    sendVerify, forgotPassword, changeEmail
}

