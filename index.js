const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require('express-session');
dotenv.config();
const passport = require("passport");
const { loginCheck } = require("./auth/passport");
loginCheck(passport);

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

//add socket-io using express and server
// const io = new Server(server, {
//     cors: {
//       methods: ['GET', 'POST'],
//     },
//   });
 
io.on('connection', (socket) => {
  console.log('User connected');

  // Écouter l'événement 'chatMessage' côté serveur
  socket.on('chatMessage', (message) => {
      // Renvoyer le message à tous les clients connectés (y compris l'expéditeur)
      io.emit('chatMessage', message);
      console.log({ message });
  });

  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});


const PORT = process.env.PORT || 4111;

server.listen(PORT, console.log("Server has started at port " + PORT));