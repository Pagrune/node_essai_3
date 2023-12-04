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

  socket.on('createRoom', async (roomInfo) => {
    try {
      const { room } = roomInfo;
      const roomId = await createRoom(room);
   

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    } catch (error) {
      console.error('Error creating/joining conversation:', error);
    }
  });

  socket.on('enterRoom', async (data) => {
    try {
        const { room } = data;
        socket.join(room);

        const CHAT_BOT = 'ChatBot';
        let __createdtime__ = Date.now();

        // Send welcome message to the user that just joined the chat
        socket.emit('receive_message', {
            message: `Welcome to the chat room`,
            username: CHAT_BOT,
            __createdtime__,
        });

        console.log(`User entered room ${room}`);
    } catch (error) {
        console.error('Error entering room:', error);
    }
  });

  socket.on('send_message', (data) => {
      try {
          console.log(data);
          const { message, __createdtime__, room, username } = data;

          // Broadcast the message to everyone in the room
          io.to(room).emit('receive_message', { ...data, room });

          enregistrerMessage(message, __createdtime__, room, username)
              .then((response) => console.log(response))
              .catch((err) => console.log(err));
      } catch (error) {
          console.error('Error sending message:', error);
      }
  });
});

// Function to retrieve previous messages from the database
async function getPreviousMessages(room) {
try {
    // Use Mongoose or your preferred database library to query for messages
    const messages = await Message.find({ room: room }).sort({ __createdtime__: 1 });
    return messages;
} catch (error) {
    console.error('Error retrieving previous messages:', error);
    return [];
}
}



const PORT = process.env.PORT || 4111;

server.listen(PORT, console.log("Server has started at port " + PORT));