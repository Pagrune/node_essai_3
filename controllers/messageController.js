//For message page

const passport = require("passport");
const Room = require("../models/Room");
const Message = require("../models/Message");
const bcrypt = require("bcryptjs");
// const socket = require("socket.io");


const messageView = (req, res) => {
    Message.find({ room: req.query.room })
      .sort({ __createdtime__: 1 })
      .then((messages) => {
        console.log(messages);
        res.render("chat", {
          user: req.user,
          messages: messages,
        });
      })
      .catch((error) => {
        console.error("Error retrieving messages:", error);
        // Gérer les erreurs lors de la récupération des messages
        // res.status(500).send("Error retrieving messages");
      });
    };

const createRoomView = (req, res) => {
    console.log(req.user);
    res.render("createRoom", {
        user: req.user
      });
    };

const createRoom = async (room) => {
        try {
            console.log(room);
            // Ajout de la room à la base de données
            // const { 'room-name': name } = req.body;

    
            if (!room) {
                console.log("Fill empty fields");
                // Gérer le cas où le champ name est vide
                // return res.status(400).send("Fill empty fields");
            }
    
            // Génération d'un salt pour bcrypt
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
    
            // Génération d'un hash sécurisé pour enterRoom avec bcrypt
            const enterRoom = await bcrypt.hash(room, salt);
    
            // Création de la nouvelle room
            const newRoom = new Room({
                name: room,
                enterRoom: enterRoom,
            });
    
            // Sauvegarde de la room dans la base de données
            await newRoom.save();


            const roomId = newRoom.id;
            return roomId;
    
            // Redirection vers la page de chat
            // res.redirect(`/chat?room=${newRoom.id}&user=${name}`);
        } catch (error) {
            console.error("Error creating room:", error);
            // Gérer les erreurs lors de la création de la room
            // res.status(500).send("Error creating room");
        }
    };

const enregistrerMessage = async (message, __createdtime__, room, username) => {

        try {
        //récupérer user depuis la bdd
        
        

            // Création du nouveau message
            const newMessage = new Message({
                content: message,
                user: username,
                __createdtime__,
                room,
            });
    
            // Sauvegarde du message dans la base de données
            await newMessage.save();
            return newMessage;
    
        } catch (error) {
            console.error("Error saving message:", error);
            // Gérer les erreurs lors de la sauvegarde du message
            // res.status(500).send("Error saving message");
        }
}
       

module.exports = {
    messageView,
    createRoomView,
    createRoom,
    enregistrerMessage
};