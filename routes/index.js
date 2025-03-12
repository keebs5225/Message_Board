const express = require('express');
const router = express.Router();
const moment = require('moment'); // Import moment.js
const { router: authRouter, isAuthenticated } = require('../middleware/auth'); // Correct import of isAuthenticated

// Dummy messages array
const messages = [
    { text: 'Hi there!', user: 'Amando', added: new Date(), avatar: '', id: 0, upvotes: 0, upvoters: [] },
    { text: 'Hello World!', user: 'Charles', added: new Date(), avatar: '', id: 1, upvotes: 0, upvoters: [] }
];

// Route to get all messages and render the homepage
router.get('/', (req, res) => {
  const user = req.session.user || null; // Check if user is logged in
  res.render('index', { title: 'Mini Message Board', messages, user, moment }); // Pass moment to the view
});

// Route to render the new message form
router.get('/new', isAuthenticated, (req, res) => {
  res.render('form'); // Render the form page for creating new messages
});

// Route to handle posting a new message
router.post('/new', isAuthenticated, (req, res) => {
  const { messageText } = req.body;
  const user = req.session.user;

  if (!messageText) {
    req.flash('error', 'Message text is required.');
    return res.redirect('/new'); // Redirect back to the new message form
  }

  messages.push({
    text: messageText,
    user: user.username,
    added: new Date(),
    avatar: user.avatar || '',
    id: messages.length,
    upvotes: 0
  });

  req.flash('success', 'Your message has been posted successfully.');
  res.redirect('/'); // Redirect to homepage after message is added
});

// Route to view a specific message by ID
router.get('/message/:id', (req, res) => {
    const message = messages.find(m => m.id == req.params.id);
    if (!message) return res.redirect('/'); // Redirect if message not found
  
    const user = req.session.user || null;
    res.render('message', { message, user, moment, messages: req.flash() }); // Pass flash messages here
});
  
// Route to upvote a specific message
router.post('/message/:id/upvote', (req, res) => {
  const message = messages.find(m => m.id == req.params.id);

  if (!message) {
    return res.status(404).send('Message not found');
  }

  const user = req.session.user;

  // Check if the user has already upvoted this message
  if (message.upvoters.includes(user.username)) {
    req.flash('error', 'You can only upvote a message once.');
    return res.redirect(`/message/${message.id}`);  // Redirect back to the message page
  }

  // Add user to the list of upvoters and increment the upvote count
  message.upvoters.push(user.username);
  message.upvotes++;

  req.flash('success', 'You have upvoted the message.');
  res.redirect('/'); // Redirect back to the homepage
});

// Route to delete a specific message (only allowed for the message owner or admin)
router.post('/message/:id/delete', isAuthenticated, (req, res) => {
  const message = messages.find(m => m.id == req.params.id);

  if (!message) {
    return res.redirect('/'); // Redirect if message not found
  }

  // Check if the logged-in user is the message owner or an admin
  if (message.user === req.session.user.username || req.session.user.role === 'admin') {
    const index = messages.findIndex(m => m.id == req.params.id);
    if (index !== -1) {
      messages.splice(index, 1); // Remove the message from the array
    }

    req.flash('success', 'Message deleted successfully.');
  } else {
    req.flash('error', 'You can only delete your own messages or messages as an admin.');
  }

  res.redirect('/'); // Redirect to homepage after message deletion
});

// Route to render the user's profile page with their messages
router.get('/profile', isAuthenticated, (req, res) => {
  const userMessages = messages.filter(m => m.user === req.session.user.username); // Filter messages by the logged-in user
  res.render('profile', { user: req.session.user, userMessages }); // Render the profile page with the user's messages
});

module.exports = router;
