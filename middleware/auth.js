const express = require('express');
const router = express.Router();

// Your existing middleware functions
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect('/auth/login');
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') return next();
    res.status(403).send('Access denied');
}

// Authentication routes
router.get('/login', (req, res) => {
    res.render('login');  // Render login page
});

router.get('/signup', (req, res) => {
    res.render('signup');  // Render signup page
});

router.post('/login', (req, res) => {
    // Handle login logic here
});

router.post('/signup', (req, res) => {
    // Handle signup logic here
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');  // Redirect to login after logout
    });
});

// Export the router and middleware
module.exports = { isAuthenticated, isAdmin, router };
