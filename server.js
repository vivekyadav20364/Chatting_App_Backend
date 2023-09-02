const express=require('express');
const dotenv=require('dotenv');
dotenv.config();
const cors=require('cors');
const connectDB = require('./config/db');
const userRoutes=require('./routes/userRoutes');
const chatRoutes=require("./routes/chatRoutes");
const messageRoutes=require("./routes/messageRoutes");
const { TokenExpiredError } = require('jsonwebtoken');

// const {notFound,errorHandler} =require("./middleware/errorMiddleware");
// require('dotenv').config({path:'./.env'})
require('dotenv').config({path:__dirname+'../'})
const app=express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/messages',messageRoutes);

// app.use(notFound);
// app.use(errorHandler);

app.get('/',(req,res)=>{
    res.send("Heloo");
})

const server=app.listen(process.env.PORT,()=>console.log(`server is running on port ${process.env.PORT}`));

//Chat app work fine but it is not real time chat so make it real time chat we need to include socket io in the project
 
const io=require('socket.io')(server,{
    pingTimeout:60000,   //the connection is active only for the 60 sec and after that the connection is closed to save the bandwidth
    cors: {
        origin:"http://localhost:3000",
    }
});

io.on("connection" , (socket)=>{        // this required a name and we give the name connection
  console.log("connected to socket.io");

  socket.on('setup',(userData)=>{    //here we create new socket setup in which only one user can join which has id (provided by the forntend part)
    socket.join(userData._id);        //creating room with logged in user
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat",(room)=>{
    socket.join(room);
    console.log("user joined Room: ",room);
  });

  socket.on("new message",(newmessageRecieved)=>{
    var chat=newmessageRecieved.chat;
    if(!chat.users) return console.log("chat users not defined");

    chat.users.forEach(user => {
      if(user._id===newmessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved",newmessageRecieved);

    });
     
  })
})
