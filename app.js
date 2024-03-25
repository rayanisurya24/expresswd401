const express = require("express");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "movie402")));

const serviceAccount = require('./key.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.set("views", path.join(__dirname, "movie402")); 
app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({ extended: true })); 

// Hashing passwords
const bcrypt = require('bcrypt');
const saltRounds = 10; // Salt rounds for bcrypt

app.get("/signup401", function (req, res) {
  res.render("signup401"); // Render signup.ejs
});

app.get("/login401", function (req, res) {
  res.render("login401"); // Render login.ejs
});

app.get("/dashboard", function (req, res) {
  res.render("index"); // Render index.ejs
});

app.post("/signupSubmit", function (req, res) {
  const { email, password } = req.body;
  bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).send("Error: Unable to sign up. Please try again later.");
    }
    db.collection("todo")
      .add({
        email: email,
        password: hash 
      })
      .then(() => {
        res.send("Sign up is successful. Go to <a href='/login401'>login</a>. ");
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
        res.status(500).send("Error: Unable to sign up. Please try again later.");
      });
  });
});

app.post("/loginSubmit", function (req, res) {
  const { email, password } = req.body;
  db.collection("todo")
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size === 0) {
        return res.send("User not found.");
      }
      const user = docs.docs[0].data();
      bcrypt.compare(password, user.password, function(err, result) {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).send("Error: Unable to login. Please try again later.");
        }
        if (result) {
          res.render("index"); 
        } else {
          res.send("Incorrect password.");
        }
      });
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
      res.status(500).send("Error: Unable to login. Please try again later.");
    });
});

app.listen(3000, () => {
  console.log("Listening at http://localhost:3000");
});
