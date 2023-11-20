//js
const express = require('express');
const { registerView, loginView, registerUser, loginUser } = require('../controllers/loginController');
const router = express.Router();
const { protectRoute } = require("../auth/protect");
const { dashboardView } = require("../controllers/dashboardController");
const { messageView, createRoomView } = require("../controllers/messageController");


// route to home page
router.get('/', (req, res) => {
    res.render('home');
});

// route to chat from chat.ejs (protected route)
router.get('/chat', protectRoute, messageView);

// Exemple de rendu de la vue avec une variable user
router.get('/createRoom', protectRoute, createRoomView);

router.get('/register', registerView);
router.get('/login', loginView);
router.get("/dashboard", protectRoute, dashboardView);

//logout action
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

const path = require('path');


router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
