const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const grid = require('gridfs-stream');

require('dotenv').config();

const UserRouter = require('./Routes/UserRoute');
const AuthRouter = require('./Routes/AuthRoute');
const VerifyRouter = require('./Routes/VerifyRoute');
const OnlineRouter = require('./Routes/OnlineRoute');
const BlogRouter = require('./Routes/BlogRoute');
const ChatRouter = require('./Routes/ChatRoute');
const ConversationRouter = require('./Routes/ConversationRoute');

const app = express();

app.use(cors());
app.use(express.json());


//Connect to Database

const local_database = process.env.LOCAL_DATABASE_CONNECTION;
const host_database = process.env.HOST_DATABASE_CONNECTION 

mongoose.connect( local_database ,  {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const database = mongoose.connection;
const port = process.env.PORT || 3000;

database.on("error" ,(err)=>{
    console.log(err);  
});

let gfs;

database.once("open" , ()=>{
    gfs = grid(database.db , mongoose.mongo);
    gfs.collection("User")
    console.log("Successfully Connected to the MongoDB Database"); 
});

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

//Listening
app.listen(process.env.PORT , ()=>{
    console.log(`Listening at port ${port}`);
})

//Defining Route
app.use('/user' , UserRouter);
app.use('/auth' , AuthRouter);
app.use('/verify' , VerifyRouter);
app.use('/online', OnlineRouter);
app.use('/blog' , BlogRouter)
app.use('/chat' , ChatRouter);
app.use('/conv' , ConversationRouter);