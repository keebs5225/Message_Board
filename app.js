const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const indexRouter = require('./routes/index');
const { router: authRouter } = require('./middleware/auth'); // Correctly import the authRouter
const { analyzeSentiment, moderateContent } = require('./middleware/moderation');
const { isAuthenticated, isAdmin } = require('./middleware/auth');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);   // Main app routes
app.use('/auth', authRouter);  // Auth routes

// Apply moderation and sentiment analysis middleware where necessary
app.post('/new', isAuthenticated, analyzeSentiment, moderateContent, (req, res) => {
  const { messageText } = req.body;
  const user = req.session.user;

  // Check if user is authenticated
  if (!user) return res.redirect('/auth/login');

  // Your logic for adding the new message
  res.redirect('/');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
