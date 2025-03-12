const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db'); // SQLite database file

// Create the users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT
  )
`);

module.exports = db;
