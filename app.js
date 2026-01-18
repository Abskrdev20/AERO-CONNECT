const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/* LANDING */
app.get("/", (req, res) => res.render("home"));

/* AUTH */
app.get("/login", (req, res) => {
  res.render("auth/login");
});

app.get("/login/admin", (req, res) => {
  res.render("auth/admin-login");
});

app.get("/register", (req, res) => {
  res.render("auth/register");
});

app.get("/forgot-password", (req, res) => {
  res.render("auth/forgot");
});


app.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});
