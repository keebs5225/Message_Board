const crypto = require('crypto');

// Function to hash a password
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex'); // Hash the password
    resolve({ hashedPassword, salt }); // Return both hashed password and salt for storage
  });
};
