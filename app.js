require("dotenv").config();
const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const dotenv = require("dotenv");
const session = require("express-session");

const User = require("./models/User");
const Grievance = require("./models/Grievance");
const Department = require("./models/Department");

dotenv.config();

/* ================= DATABASE CONNECTION ================= */
const connectDB = require("./config/db");
connectDB(); // <-- connect MongoDB

//dotenv.config(); // <-- load env variables
const authRoutes = require("./routes/auth");

/* ================= APP INITIALIZATION ================= */

const app = express();

/* ================= VIEW ENGINE SETUP ================= */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ================= MIDDLEWARE ================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log("➡️ INCOMING:", req.method, req.url);
  next();
});


app.use(
  session({
    secret: "aero-connect-secret",
    resave: false,
    saveUninitialized: false
  })
);

/* ================= ROUTE HANDLERS (CONTROLLERS) ================= */
const authRoutes = require("./routes/auth");
const grievanceRoutes = require("./routes/grievance");
const adminAuthRoutes = require("./routes/adminAuth");
const adminRoutes = require("./routes/admin");
const adminController = require("./controllers/adminController");

app.use("/auth", authRoutes);
app.use("/grievances", grievanceRoutes);
app.use("/admin-auth", adminAuthRoutes);
app.use("/admin", adminRoutes);

/* ================= LANDING & AUTH VIEWS ================= */
app.get("/", (req, res) => res.render("home"));
app.get("/login", (req, res) => res.render("auth/login"));
app.get("/login/admin", (req, res) => res.render("auth/admin-login"));
app.get("/register", (req, res) => res.render("auth/register"));
app.get("/forgot-password", (req, res) => res.render("auth/forgot"));

/* ================= USER DASHBOARD ================= */
app.get("/dashboard", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.redirect("/login");

    const grievances = await Grievance.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const total = await Grievance.countDocuments({ user: user._id });
    const pending = await Grievance.countDocuments({
      user: user._id,
      status: { $in: ["OPEN", "UNDER_REVIEW"] }
    });
    const resolved = await Grievance.countDocuments({
      user: user._id,
      status: "RESOLVED"
    });

    res.render("dashboard", {
      currentUser: {
        name: user.fullName,
        empId: user.employeeId,
        designation: user.position.replace(/_/g, " "),
        department: user.department,
        email: user.email,
        stats: { total, pending, resolved }
      },
      grievances,
      page: "dashboard"
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.redirect("/login");
  }
});

/* ================= CONSOLIDATED ADMIN DASHBOARD ================= */
app.get("/admin/dashboard", async (req, res) => {
  try {
    if (!req.session.adminId) return res.redirect("/login/admin");

    const admin = await Department.findById(req.session.adminId).lean();
    if (!admin) {
      req.session.adminId = null;
      return res.redirect("/login/admin");
    }

    // 🏆 SUPERADMIN REDIRECTION
    if (admin.role === "SUPERADMIN") {
      return adminController.getSuperAdminDashboard(req, res);
    }

    // 🏢 DEPARTMENT ADMIN VIEW
    const grievances = await Grievance.find({ category: admin.name })
      .sort({ createdAt: -1 })
      .lean();

    res.render("admin/dashboard", {
      department: admin,
      grievances,
      role: admin.role,
      stats: { 
        total: grievances.length, 
        resolved: grievances.filter(g => g.status === "RESOLVED").length 
      }
    });
  } catch (err) {
    console.error("Admin Dashboard Error:", err);
    res.redirect("/login/admin");
  }
});

/* ================= EXCLUSIVE SUPERADMIN ROUTE ================= */
app.get("/admin/super-dashboard", async (req, res) => {
  if (req.session.role !== "SUPERADMIN") return res.redirect("/admin/dashboard");
  return adminController.getSuperAdminDashboard(req, res);
});

/* ================= ADMIN ACTION ROUTES ================= */
app.get("/admin/grievances/:grievanceId", async (req, res) => {
  if (!req.session.adminId) return res.redirect("/login/admin");

  const grievance = await Grievance.findOne({ grievanceId: req.params.grievanceId })
    .populate("user", "fullName employeeId email department position")
    .lean();

  if (!grievance) return res.redirect("/admin/dashboard");

  res.render("grievance-detail", { grievance, isAdmin: true });
});

app.post("/admin/grievances/:grievanceId/action", async (req, res) => {
  if (!req.session.adminId) return res.redirect("/login/admin");

  const { remark } = req.body;
  const grievance = await Grievance.findOne({ grievanceId: req.params.grievanceId });

  if (!grievance) return res.redirect("/admin/dashboard");

  if (grievance.status === "OPEN") {
    grievance.status = "UNDER_REVIEW";
    grievance.reviewedAt = new Date();
  } else if (grievance.status === "UNDER_REVIEW") {
    grievance.status = "RESOLVED";
    grievance.resolvedAt = new Date();
    grievance.departmentComment = remark;
  }

  await grievance.save();
  res.redirect(`/admin/grievances/${grievance.grievanceId}`);
});

/* ================= COMMON UTILITY ROUTES ================= */
app.get("/grievances/:grievanceId", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  const grievance = await Grievance.findOne({ grievanceId: req.params.grievanceId })
    .populate("user", "fullName employeeId email department position")
    .lean();
  if (!grievance) return res.redirect("/dashboard");
  res.render("grievance-detail", { grievance, isAdmin: false });
});

app.get("/admin/create-department", (req, res) => {
  if (!req.session.adminId || req.session.role !== "SUPERADMIN") {
    return res.redirect("/admin/dashboard");
  }
  const message = req.session.adminMessage;
  req.session.adminMessage = null;
  res.render("admin/create-department", { adminMessage: message });
});

/* ================= USER GRIEVANCE PAGE ================= */
app.get("/grievances", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const user = await User.findById(req.session.userId).lean();
  if (!user) return res.redirect("/login");

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

/* ================= PROFILE ================= */
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
  req.session.destroy(() => res.redirect("/"));
});

/* ================= TRACKING LOGIC ================= */
app.get("/track", (req, res) => res.render("track"));

app.post("/track/status", async (req, res) => {
  try {
    const { token } = req.body;
    const grievance = await Grievance.findOne({ grievanceId: token }).lean();

    if (!grievance) {
      return res.render("track", { 
        error: "Invalid grievance token. Please check and try again.", 
        token 
      });
    }

    let statusLabel, statusClass, step;
    switch (grievance.status) {
      case "OPEN": statusLabel = "Open"; statusClass = "status-open"; step = 1; break;
      case "UNDER_REVIEW": statusLabel = "Under Review"; statusClass = "status-review"; step = 2; break;
      case "RESOLVED": statusLabel = "Resolved"; statusClass = "status-resolved"; step = 3; break;
      case "CLOSED": statusLabel = "Closed"; statusClass = "status-closed"; step = 4; break;
    }

    const timeline = [`${grievance.createdAt.toDateString()} – Grievance Raised`];
    if (grievance.reviewedAt) timeline.push(`${grievance.reviewedAt.toDateString()} – Under Review by Department`);
    if (grievance.resolvedAt) timeline.push(`${grievance.resolvedAt.toDateString()} – Grievance Resolved`);

    res.render("trackstatus", {
      token: grievance.grievanceId,
      submissionDate: grievance.createdAt.toDateString(),
      lastUpdated: grievance.updatedAt.toDateString(),
      department: grievance.category,
      priority: grievance.priority.toUpperCase(),
      statusLabel, statusClass, step,
      remark: grievance.departmentComment || null,
      timeline
    });
  } catch (err) {
    res.status(500).render("track", { error: "Something went wrong. Please try again later." });
  }
});

app.post("/track/status", (req, res) => {
  // your existing logic – unchanged
});

const transporter = require("./config/mailer");

app.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Mail",
      text: "Agar ye mail aayi, toh nodemailer ka setup successful 🎉",
    });

    res.send("Mail sent successfully");
  } catch (err) {
    console.error(err);
    res.send("Mail failed");
  }
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));