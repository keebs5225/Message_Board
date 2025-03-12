const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');  // Import connect-flash
const dotenv = require('dotenv');
const app = express();

// Import routes and middleware
const indexRouter = require('./routes/index');
const { router: authRouter } = require('./middleware/auth');
const { analyzeSentiment, moderateContent } = require('./middleware/moderation');
const { isAuthenticated } = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Set view engine and views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: true 
}));
app.use(flash());  // Use connect-flash for flash messages
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files


// Routes
app.use('/', indexRouter); // Use indexRouter for the homepage
app.use('/auth', authRouter); // Use authRouter for authentication routes

// Apply moderation and sentiment analysis middleware
app.post('/new', isAuthenticated, analyzeSentiment, moderateContent, (req, res) => {
  const { messageText } = req.body;
  const user = req.session.user;

  if (!user) return res.redirect('/auth/login'); // Redirect if not logged in

  // Process and redirect after moderation and sentiment analysis
  res.redirect('/');
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
