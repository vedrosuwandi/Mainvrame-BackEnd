const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const UserRouter = require('./Routes/UserRoute');
const AuthRouter = require('./Routes/AuthRoute');

const app = express();

app.use(cors());
app.use(express.json());

//Connect to Database


mongoose.connect( process.env.DATABASE_CONNECTION ,  {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const database = mongoose.connection;

database.on("error" ,(err)=>{
    console.log(err);  
});

database.once("open" , ()=>{
    console.log("Successfully Connected to the MongoDB Database"); 
});

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

//Listening
app.listen(process.env.PORT , ()=>{
    console.log(`Listening at port ${process.env.PORT}`);
})

//Defining Route
app.use('/user' , UserRouter);
app.use('/auth' , AuthRouter);