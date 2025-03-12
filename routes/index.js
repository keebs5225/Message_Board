const express = require('express');
const router = express.Router();
const moment = require('moment');
const { isAuthenticated } = require('../middleware/auth');
const formatDate = require('../utils/dateFormatter');

const messages = [
  { text: 'Hi there!', user: 'Amando', added: new Date(), avatar: '', id: 0, upvotes: 0 },
  { text: 'Hello World!', user: 'Charles', added: new Date(), avatar: '', id: 1, upvotes: 0 }
];

router.get('/', (req, res) => {
  res.render('index', { title: 'Mini Message Board', messages, user: req.session.user });
});

router.get('/new', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  res.render('form');
});

router.post('/new', (req, res) => {
  const { messageText } = req.body;
  const user = req.session.user;
  if (!user) return res.redirect('/auth/login');

  messages.push({
    text: messageText,
    user: user.username,
    added: new Date(),
    avatar: user.avatar,
    id: messages.length,
    upvotes: 0
  });
  res.redirect('/');
});

router.get('/message/:id', (req, res) => {
  const message = messages.find(m => m.id == req.params.id);
  if (!message) return res.redirect('/');
  res.render('message', { message });
});

router.post('/message/:id/upvote', (req, res) => {
  const message = messages.find(m => m.id == req.params.id);
  if (message) message.upvotes++;
  res.redirect('/');
});

// Deleting a Message
router.post('/message/:id/delete', isAuthenticated, (req, res) => {
  const message = messages.find(m => m.id == req.params.id);
  
  if (!message) {
    return res.redirect('/');
  }

  // Check if the user is allowed to delete the message
  if (message.user === req.session.user.username || req.session.user.role === 'admin') {
    const index = messages.findIndex(m => m.id == req.params.id);
    if (index !== -1) {
      messages.splice(index, 1);
    }
  } else {
    return res.status(403).send('You can only delete your own messages.');
  }

  res.redirect('/');
});

router.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');
  const userMessages = messages.filter(m => m.user === req.session.user.username);
  res.render('profile', { user: req.session.user, userMessages });
});

module.exports = router;
