const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

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
    console.log(req.body);
    const { username, password, confirmPassword } = req.body;
    console.log(username, password, confirmPassword);

    // Check if password is provided
    if (!password) {
      console.error('No password provided for hashing');
      return res.status(400).json({ message: 'Password is required' });
    }
  
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
  
    // Check if username already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        console.error('Error checking if username exists', err);
        return res.status(500).json({ message: 'Server error during username check' });
      }
  
      if (user) {
        return res.status(400).json({ message: 'Username already exists' });
      }
  
      try {
        // Hash the password
        const { hashedPassword, salt } = await hashPassword(password);
  
        // Store the new user in the database with the hashed password and salt
        const stmt = db.prepare('INSERT INTO users (username, password, salt, role) VALUES (?, ?, ?, ?)');
        stmt.run(username, hashedPassword, salt, 'user', (err) => {
          if (err) {
            console.error('Error inserting new user into DB', err);
            return res.status(500).json({ message: 'Server error during user insertion' });
          }
  
          console.log('New user inserted:', username);
          res.redirect('/auth/login'); // Redirect to login page after successful sign-up
        });
        stmt.finalize();
      } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).json({ message: 'Error during password hashing' });
      }
    });
});
  
// Login route (GET)
router.get('/login', (req, res) => {
    res.render('login'); // Render the login page (ensure you have a 'login.ejs' view)
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!password) {
    console.error('No password provided for login');
    return res.status(400).json({ message: 'Password is required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.error('Error fetching user', err);
      return res.status(500).json({ message: 'Server error during user fetch' });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    try {
      const isMatch = checkPassword(password, user.password, user.salt);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      req.session.user = { username: user.username, role: user.role };
      res.redirect('/'); // Redirect to the homepage after successful login
    } catch (err) {
      console.error('Error checking password:', err);
      res.status(500).json({ message: 'Error during password validation' });
    }
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
