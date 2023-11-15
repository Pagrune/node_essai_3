//js
const express = require('express');
const {registerView, loginView, registerUser, loginUser } = require('../controllers/loginController');
const router = express.Router();
const { protectRoute } = require("../auth/protect");
const { dashboardView } = require("../controllers/dashboardController");

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


router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;