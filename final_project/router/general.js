const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Convert books object to an array if needed
const booksArray = Object.values(books);

// Register a new user
public_users.post("/register", async (req, res) => {
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

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      const booksList = await new Promise((resolve, reject) => {
        if (booksArray.length > 0) {
          resolve(booksArray);
        } else {
          reject("Books not found");
        }
      });
      res.json(booksList);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      const isbn = req.params.isbn;
      const book = await new Promise((resolve, reject) => {
        const foundBook = Object.values(books).find(b => b.isbn === isbn);
        if (foundBook) {
          resolve(foundBook);
        } else {
          reject("Book not found");
        }
      });
      res.json(book);
    } catch (error) {
      res.status(404).json({ message: error });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
      const author = req.params.author.toLowerCase();
      const booksByAuthor = await new Promise((resolve, reject) => {
        const foundBooks = booksArray.filter(b => b.author.toLowerCase().includes(author));
        if (foundBooks.length > 0) {
          resolve(foundBooks);
        } else {
          reject("Books by this author not found");
        }
      });
      res.json(booksByAuthor);
    } catch (error) {
      res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
      const title = req.params.title.toLowerCase();
      const booksByTitle = await new Promise((resolve, reject) => {
        const foundBooks = booksArray.filter(b => b.title.toLowerCase().includes(title));
        if (foundBooks.length > 0) {
          resolve(foundBooks);
        } else {
          reject("Books with this title not found");
        }
      });
      res.json(booksByTitle);
    } catch (error) {
      res.status(404).json({ message: error });
    }
});

// Get book review
public_users.get('/review/:isbn', async function (req, res) {
    try {
      const isbn = req.params.isbn;
      const reviews = await new Promise((resolve, reject) => {
        const book = booksArray.find(b => b.isbn === isbn);
        if (book && book.reviews) {
          resolve(book.reviews);
        } else {
          reject("Reviews for this book not found");
        }
      });
      res.json(reviews);
    } catch (error) {
      res.status(404).json({ message: error });
    }
});

module.exports.general = public_users;
