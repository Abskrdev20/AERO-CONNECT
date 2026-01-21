const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const dotenv = require("dotenv");

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

app.use("/auth", authRoutes);

// --- Mock Data for Dashboard ---
const mockUser = {
  name: "Vritti Garg",
  empId: "AAI-EMP-2026",
  designation: "Junior Engineer",
  department: "IT Department",
  email: "vritti.garg@aai.aero",
  joiningDate: "12 Aug 2024",
  stats: {
    total: 12,
    pending: 4,
    resolved: 8
  }
};

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
app.get("/dashboard", (req, res) => {
  res.render("dashboard", { currentUser: mockUser, page: "dashboard" });
});

app.get("/admin/dashboard", (req, res) => {
  res.render("admin/dashboard", { page: "admin-dash" });
});

app.get("/grievances", (req, res) => {
  res.render("grievances", { currentUser: mockUser, page: "grievances" });
});

app.get("/profile", (req, res) => {
  res.render("profile", { currentUser: mockUser, page: "profile" });
});

app.get("/logout", (req, res) => {
  res.redirect("/");
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