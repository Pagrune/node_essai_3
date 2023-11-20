const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require('express-session');
dotenv.config();
const passport = require("passport");
const { loginCheck } = require("./auth/passport");
loginCheck(passport);
const { createRoom } = require('./controllers/messageController');

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

  // Écouter l'événement 'joinRoom' côté serveur
  socket.on('joinRoom', async (roomInfo) => {
    try {
      const { room } = roomInfo;
      // console.log(roomInfo);
      const roomId = await createRoom(room);
      console.log(roomId);

      // Joindre la room spécifiée
      socket.join(roomId);

      // Émettre un événement pour indiquer que la room a été rejointe avec succès
      socket.emit('roomJoined', { room: roomId });

      // Écouter l'événement 'chatMessage' côté serveur
      socket.on('chatMessage', async (data) => {
        try {
          // Enregistrer le message dans la base de données
          const { user, content } = data;
          const newMessage = new Message({ room: roomId, user, content });
          await newMessage.save();

          // Renvoyer le message à tous les clients connectés dans la room
          io.to(roomId).emit('chatMessage', newMessage);
        } catch (error) {
          console.error(error);
        }
      });

      // Écouter l'événement 'disconnect' côté serveur
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    } catch (error) {
      console.error('Error creating/joining conversation:', error);
    }
  });
});



const PORT = process.env.PORT || 4111;

server.listen(PORT, console.log("Server has started at port " + PORT));