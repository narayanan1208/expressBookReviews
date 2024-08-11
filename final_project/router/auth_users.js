const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid
const isValid = (username) => {
    // Check if the username is valid (exists in users array)
    return users.some(user => user.username === username);
}
  
// Authenticate user credentials
const authenticatedUser = (username, password) => {
    // Check if username and password match the one we have in records
    return users.some(user => user.username === username && user.password === password);
}
  
// Register a new user
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (isValid(username)) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});
  
// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, "your_jwt_secret_key", { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});
  
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const token = req.session.token;
  
    if (!token) {
      return res.status(401).json({ message: "Access denied: No token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, "your_jwt_secret_key");
      const username = decoded.username;
  
      const bookKey = Object.keys(books).find(key => books[key].isbn === isbn);
      if (!bookKey) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      if (!books[bookKey].reviews) {
        books[bookKey].reviews = {};
      }
  
      books[bookKey].reviews[username] = review;
  
      return res.status(200).json({ message: "Review added/modified successfully" });
    } catch (ex) {
      return res.status(400).json({ message: "Invalid token" });
    }
});
  
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const token = req.session.token;
  
    if (!token) {
      return res.status(401).json({ message: "Access denied: No token provided" });
    }
  
    try {
      const decoded = jwt.verify(token, "your_jwt_secret_key");
      const username = decoded.username;
  
      const bookKey = Object.keys(books).find(key => books[key].isbn === isbn);
      if (!bookKey) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      if (!books[bookKey].reviews || !books[bookKey].reviews[username]) {
        return res.status(404).json({ message: "Review not found" });
      }
  
      delete books[bookKey].reviews[username];
  
      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (ex) {
      return res.status(400).json({ message: "Invalid token" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
