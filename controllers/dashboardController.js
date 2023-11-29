//For Register Page
const Room = require('../models/Room');

const dashboardView = async  (req, res) => {
  try {
    // Récupérer la liste des rooms depuis la base de données
    const rooms = await Room.find();

        res.render('dashboard', { user: req.user, rooms });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).send('Error fetching rooms');
    } 
  };
  module.exports = {
    dashboardView,
  };