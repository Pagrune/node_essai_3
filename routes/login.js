//js
const express = require('express');
const {registerView, loginView, registerUser, loginUser } = require('../controllers/loginController');
const router = express.Router();
const { protectRoute } = require("../auth/protect");
const { dashboardView } = require("../controllers/dashboardController");

// route to home page
router.get('/', (req, res) => {
    res.render('home');
});

// route to chat from chat.ejs
router.get('/chat', (req, res) => {
    res.render('chat');
});

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

// // Utilise le middleware protectRoute pour protéger la route "/chat"
// router.get('/chat', protectRoute, (req, res) => {
//     const options = {
//         root: path.join(__dirname, '../public/')
//     };
//     res.sendFile('chat.html', options);
// });

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;