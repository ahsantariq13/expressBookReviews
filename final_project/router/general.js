const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (!users.some((user) => user.username === username)) {
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
  }
  return res.status(400).json({ message: "User already exists" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const promise = new Promise((resolve, reject) => {
    const result = Object.entries(books).map(([key, book]) => ({
      isbn: key,
      ...book,
    }));
    resolve(result);
  });
  promise
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const promise = new Promise((resolve, reject) => {
    const book = books[req.params.isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });

  promise
    .then((book) => {
      const result = {
        isbn: req.params.isbn,
        ...book,
      };
      return res.status(200).json(result);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const { author } = req.params;

  const promise = new Promise((resolve, reject) => {
    const result = [];
    const keys = Object.keys(books);
    for (const key of keys) {
      if (books[key].author === author) {
        result.push({ isbn: key, ...books[key] });
      }
    }
    resolve(result);
  });

  promise
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;

  const promise = new Promise((resolve, reject) => {
    const result = [];
    const keys = Object.keys(books);
    for (const key of keys) {
      if (books[key].title === title) {
        result.push({ isbn: key, ...books[key] });
      }
    }
    resolve(result);
  });

  promise
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
