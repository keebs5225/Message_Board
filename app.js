// app.js
const express = require('express');
const path = require('path');
const app = express();
const indexRouter = require('./routes/index');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use('/', indexRouter);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});