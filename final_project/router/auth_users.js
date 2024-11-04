const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({ username }, "secret_key_123", {
        expiresIn: 60 * 60,
      });
      return res.status(200).json({ message: "Login successful", accessToken });
    }
  }
  return res.status(401).json({ message: "Invalid username or password" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  const user = req.user;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  console.log(req.user);
  books[isbn].reviews[user.username] = review;
  const result = {
    isbn: isbn,
    ...books[isbn],
  };
  return res
    .status(200)
    .json({ message: "Review added successfully", book: result });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const user = req.user;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  delete books[isbn].reviews[user.username];
  const result = {
    isbn: isbn,
    ...books[isbn],
  };
  return res
    .status(200)
    .json({ message: "Review deleted successfully", book: result });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
