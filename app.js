const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");

const app = express();

// Use path.join to ensure cross-platform compatibility and correct relative paths
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
// Pointing to the 'views' directory correctly
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
// Pointing to the 'public' directory correctly
app.use(express.static(path.join(__dirname, "public")));

// --- Mock Data for Dashboard (Required for the dashboard to work) ---
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

/* LANDING PAGE */
app.get("/", (req, res) => res.render("home"));

/* AUTH ROUTES */
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

/* DASHBOARD ROUTES */
app.get("/dashboard", (req, res) => {
  // Renders views/dashboard.ejs
  res.render("dashboard", { currentUser: mockUser, page: 'dashboard' });
});

// 2. Admin Dashboard Route (Naya Add Karein)
app.get("/admin/dashboard", (req, res) => {
  // Yeh 'views/admin/dashboard.ejs' ko render karega
  res.render("admin/dashboard", { page: 'admin-dash' });
});

app.get("/grievances", (req, res) => {
  // Renders views/grievances.ejs
  res.render("grievances", { currentUser: mockUser, page: 'grievances' });
});

app.get("/profile", (req, res) => {
  // Renders views/profile.ejs
  res.render("profile", { currentUser: mockUser, page: 'profile' });
});

// Logout Route
app.get("/logout", (req, res) => {
  res.redirect("/");
});

/* =====================================================
   ================= TRACKING (TUMHARA PART) ===========
   ===================================================== */

// Track Status page open
app.get("/track", (req, res) => {
  res.render("track");   // views/track.ejs
});

// Track Status result (tumhara dummy backend logic)
app.post("/track/status", (req, res) => {
  const token = req.body.token;
  if (!token) return res.redirect("/track");

  const departments = [
    "Airport Services Department",
    "Security Department",
    "Technical / IT Department",
    "Human Resources Department",
    "Finance Department"
  ];

  const lastDigit = parseInt(token.slice(-1)) || 0;
  const department = departments[lastDigit % departments.length];

  let status, progress, timeline, remark;

  const submissionDate = "10 January 2026";
  const lastUpdated = "18 January 2026";

  if (lastDigit <= 2) {
    status = "Submitted";
    progress = 20;
    remark = "Your grievance has been received and is awaiting review.";
    timeline = [
      "Grievance submitted",
      "Pending department review"
    ];
  } else if (lastDigit <= 4) {
    status = "Under Review";
    progress = 50;
    remark = "The grievance is under review by the concerned department.";
    timeline = [
      "Grievance submitted",
      `Assigned to ${department}`,
      "Under review"
    ];
  } else if (lastDigit === 5) {
    status = "Rejected";
    progress = 0;
    remark = "The grievance has been rejected due to incomplete information.";
    timeline = [
      "Grievance submitted",
      "Reviewed",
      "Rejected"
    ];
  } else if (lastDigit === 6) {
    status = "Escalated";
    progress = 70;
    remark = "The grievance has been escalated to a higher authority.";
    timeline = [
      "Grievance submitted",
      "No action within time",
      "Escalated"
    ];
  } else if (lastDigit <= 8) {
    status = "Action in Progress";
    progress = 80;
    remark = "Action is being taken on the grievance.";
    timeline = [
      "Grievance submitted",
      `Handled by ${department}`,
      "Action in progress"
    ];
  } else {
    status = "Resolved";
    progress = 100;
    remark = "The grievance has been resolved successfully.";
    timeline = [
      "Grievance submitted",
      "Action completed",
      "Resolved"
    ];
  }

  res.render("trackstatus", {
    token,
    department,
    status,
    progress,
    submissionDate,
    lastUpdated,
    timeline,
    officer: "Grievance Redressal Officer",
    remark
  });
});

/* ================= SERVER ================= */
app.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});