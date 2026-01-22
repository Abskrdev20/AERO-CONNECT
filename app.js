const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const dotenv = require("dotenv");
const session = require("express-session");
const User = require("./models/User");


dotenv.config(); // <-- load env variables

const connectDB = require("./config/db"); // <-- DB connection
connectDB(); // <-- connect MongoDB
const authRoutes = require("./routes/auth");
const app = express();

// EJS setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "aero-connect-secret", // move to .env later
    resave: false,
    saveUninitialized: false
  })
);

const grievanceRoutes = require("./routes/grievance");
app.use("/grievances", grievanceRoutes);

const Grievance = require("./models/Grievance");




app.use("/auth", authRoutes);



/* ================= LANDING ================= */
app.get("/", (req, res) => {
  res.render("home");
});

/* ================= AUTH ================= */
app.get("/login", (req, res) => res.render("auth/login"));
app.get("/login/admin", (req, res) => res.render("auth/admin-login"));
app.get("/register", (req, res) => res.render("auth/register"));
app.get("/forgot-password", (req, res) => res.render("auth/forgot"));

/* ================= DASHBOARD ================= */
app.get("/dashboard", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const user = await User.findById(req.session.userId).lean();

  // fetch user's grievances
  const grievances = await Grievance.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // calculate stats
  const total = await Grievance.countDocuments({ user: user._id });
  const pending = await Grievance.countDocuments({
    user: user._id,
    status: { $in: ["OPEN", "UNDER_REVIEW"] }
  });
  const resolved = await Grievance.countDocuments({
    user: user._id,
    status: "RESOLVED"
  });

  const currentUser = {
    name: user.fullName,
    empId: user.employeeId,
    designation: user.position.replace(/_/g, " "),
    department: user.department,
    email: user.email,
    stats: {
      total,
      pending,
      resolved
    }
  };

  res.render("dashboard", {
    currentUser,
    grievances,
    page: "dashboard"
  });
});

app.get("/admin/dashboard", (req, res) => {
  res.render("admin/dashboard", { page: "admin-dash" });
});

app.get("/grievances", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const user = await User.findById(req.session.userId).lean();

  if (!user) {
    return res.redirect("/login");
  }

  const currentUser = {
    name: user.fullName,
    empId: user.employeeId,
    email: user.email,
    department: user.department,
    designation: user.position.replace(/_/g, " ")
  };

  res.render("grievances", {
    currentUser,
    page: "grievances"
  });
});


app.get("/profile", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const user = await User.findById(req.session.userId).lean();

  res.render("profile", {
    currentUser: {
      name: user.fullName,
      empId: user.employeeId,
      designation: user.position.replace("_", " "),
      department: user.department,
      email: user.email
    },
    page: "profile"
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});


/* ================= TRACKING ================= */
app.get("/track", (req, res) => {
  res.render("track");
});

app.post("/track/status", (req, res) => {
  // your existing logic – unchanged
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
