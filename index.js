const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require('express-session');
// var sharedsession = require("express-socket.io-session");
dotenv.config();
const passport = require("passport");
// const passportSocketIo = require('passport.socketio');
const cookie = require("cookie");
const { loginCheck } = require("./auth/passport");
loginCheck(passport);
const { createRoom, enregistrerMessage } = require('./controllers/messageController');

const Message = require('./models/Message');

const http = require('http');
//const socketIo = require('socket.io');
const cors = require('cors'); // Importez le module cors

const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      methods: ['GET', 'POST'],
    },
  });

//app.use(cors()); // Add cors middleware

// Mongo DB conncetion
const database = process.env.MONGOLAB_URI;
mongoose
  .connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("mangoose connect"))
  .catch((err) => console.log(err));

app.set("view engine", "ejs");

//BodyParsing
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret:'oneboy',
    saveUninitialized: true,
    resave: true
  }));
  

app.use(passport.initialize());
app.use(passport.session());
//Routes
app.use("/", require("./routes/login"));
app.use('/messages', require('./routes/messageRoute'));


io.on('connection', (socket) => {
  console.log('User connected');
  // const user = socket.request.user;
  // console.log('info user', user);

  socket.on('joinRoom', async (roomInfo) => {
    try {
      const { room } = roomInfo;
      const roomId = await createRoom(room);

      socket.join(roomId);

      // Émettre un événement pour indiquer que la room a été rejointe avec succès
      // socket.emit('roomJoined', { room: roomId });

      // Serveur
      // socket.on('chatMessage', async (data) => {
      //   try {
      //     const username = socket.request.user.username;
      
      //     socket.to(roomId).emit('receive_message', {
      //       message: `${username} has joined the chat room`,
      //       username: CHAT_BOT,
      //       __createdtime__: Date.now(),
          // });
      
          socket.emit('receive_message', {
            message: `Welcome ${username}`,
            username: CHAT_BOT,
            __createdtime__: Date.now(),
          });
      
          // const { user, content } = data;
          // const newMessage = new Message({ room: roomId, user, content });
          // await newMessage.save();
      
          // io.to(roomId).emit('chatMessage', newMessage);
      
      //   } catch (error) {
      //     console.error(error);
      //   }
      // });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    } catch (error) {
      console.error('Error creating/joining conversation:', error);
    }
  });

  socket.on('enterRoom', async (data) => {
    try {
        const { room: roomId } = data;
        console.log('room', typeof roomId);
        console.log(socket.join(roomId));

        socket.emit('receive_message', {
          message: `Welcome to room ${roomId}`,
          username: 'Admin',
          __createdtime__: Date.now(),
        });

        console.log(`User entered room ${roomId}`);
    } catch (error) {
        console.error('Error entering room:', error);
    }
  });

  

  socket.on('send_message', (data) => {
    try {
      console.log(data);
      const { message, __createdtime__, room, username } = data; 
      console.log('room', room);    

      io.in(room).emit('receive_message', { ...data, room });
      enregistrerMessage(message, __createdtime__, room, username)
        .then((response) => console.log(response))
        .catch((err) => console.log(err));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
});




const PORT = process.env.PORT || 4111;

server.listen(PORT, console.log("Server has started at port " + PORT));