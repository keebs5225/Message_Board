const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const flash = require('connect-flash');

const router = express.Router(); // Use express.Router() to define routes
const db = new sqlite3.Database('./database.db');

// Body parser middleware to parse URL-encoded data from the form
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json()); // For parsing JSON data if necessary

// Custom password hashing function using the 'crypto' module
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex'); // Hash the password
    resolve({ hashedPassword, salt }); // Return both hashed password and salt for storage
  });
};

// Function to check if the provided password matches the stored hash and salt
const checkPassword = (password, hashedPassword, salt) => {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === hashedPassword;
};

// Render the signup page (GET request)
router.get('/signup', (req, res) => {
  res.render('signup'); // Render the 'signup' EJS page (make sure you have this view)
});

// Handle sign-up form submission (POST request)
router.post('/signup', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
  
    // Check if password is provided
    if (!password) {
      req.flash('error', 'Password is required'); // Set the flash message
      return res.redirect('/auth/signup'); // Redirect to signup page
    }
  
    // Check if passwords match
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/auth/signup');
    }
  
    // Check if username already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        req.flash('error', 'Server error during username check');
        return res.redirect('/auth/signup');
      }
  
      if (user) {
        req.flash('error', 'Username already exists');
        return res.redirect('/auth/signup');
      }
  
      try {
        // Hash the password
        const { hashedPassword, salt } = await hashPassword(password);
  
        // Store the new user in the database
        const stmt = db.prepare('INSERT INTO users (username, password, salt, role) VALUES (?, ?, ?, ?)');
        stmt.run(username, hashedPassword, salt, 'user', (err) => {
          if (err) {
            req.flash('error', 'Error during user insertion');
            return res.redirect('/auth/signup');
          }
  
          req.flash('success', 'Signup successful! Please log in.'); // Success message
          res.redirect('/auth/login'); // Redirect to login page
        });
        stmt.finalize();
      } catch (err) {
        req.flash('error', 'Error during password hashing');
        res.redirect('/auth/signup');
      }
    });
});
  
// Login route (GET)
router.get('/login', (req, res) => {
    res.render('login', { messages: req.flash() }); // Pass flash messages to the view
  });
  
  // Login route (POST)
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    if (!password) {
      req.flash('error', 'Password is required'); // Set error message
      return res.redirect('/auth/login'); // Redirect back to the login page
    }
  
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error('Error fetching user', err);
        req.flash('error', 'Server error during user fetch'); // Set error message
        return res.redirect('/auth/login'); // Redirect back to the login page
      }
  
      if (!user) {
        req.flash('error', 'Invalid username or password'); // Set error message
        return res.redirect('/auth/login'); // Redirect back to the login page
      }
  
      try {
        const isMatch = checkPassword(password, user.password, user.salt);
        if (!isMatch) {
          req.flash('error', 'Invalid username or password'); // Set error message
          return res.redirect('/auth/login'); // Redirect back to the login page
        }
  
        req.session.user = { username: user.username, role: user.role };
        res.redirect('/'); // Redirect to the homepage after successful login
      } catch (err) {
        console.error('Error checking password:', err);
        req.flash('error', 'Error during password validation'); // Set error message
        res.redirect('/auth/login'); // Redirect back to the login page
      }
    });
});
  
// Logout route (GET)
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        req.flash('error', 'Error logging out. Please try again.');
        return res.redirect('/'); // Redirect to homepage if there's an error
      }
  
      req.flash('success', 'You have logged out successfully.');
      res.redirect('/auth/login'); // Redirect to the login page after successful logout
    });
});

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/auth/login'); // Redirect to login if not authenticated
};

module.exports = { router, isAuthenticated }; // Export the router and isAuthenticated function
