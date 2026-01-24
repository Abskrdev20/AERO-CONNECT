const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const dotenv = require("dotenv");
const session = require("express-session");

const User = require("./models/User");
const Grievance = require("./models/Grievance");
const Department = require("./models/Department");

dotenv.config();

/* ================= DB ================= */
const connectDB = require("./config/db");
connectDB();

/* ================= APP ================= */
const app = express();

/* ================= EJS ================= */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ================= MIDDLEWARE ================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "aero-connect-secret",
    resave: false,
    saveUninitialized: false
  })
);

/* ================= ROUTES ================= */
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const grievanceRoutes = require("./routes/grievance");
app.use("/grievances", grievanceRoutes);

const adminAuthRoutes = require("./routes/adminAuth");
app.use("/admin-auth", adminAuthRoutes);

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

/* ================= LANDING ================= */
app.get("/", (req, res) => {
  res.render("home");
});

/* ================= AUTH ================= */
app.get("/login", (req, res) => res.render("auth/login"));
app.get("/login/admin", (req, res) => res.render("auth/admin-login"));
app.get("/register", (req, res) => res.render("auth/register"));
app.get("/forgot-password", (req, res) => res.render("auth/forgot"));

/* ================= USER DASHBOARD ================= */
app.get("/dashboard", async (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  const user = await User.findById(req.session.userId).lean();
  if (!user) return res.redirect("/login");

  const grievances = await Grievance.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(5)
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

  const currentUser = {
    name: user.fullName,
    empId: user.employeeId,
    designation: user.position.replace(/_/g, " "),
    department: user.department,
    email: user.email,
    stats: { total, pending, resolved }
  };

  res.render("dashboard", {
    currentUser,
    grievances,
    page: "dashboard"
  });
});

/* ================= ADMIN DASHBOARD ================= */
app.get("/admin/dashboard", async (req, res) => {
  try {
    if (!req.session.adminId) {
      return res.redirect("/login/admin");
    }

    const department = await Department.findById(req.session.adminId).lean();
    if (!department) {
      req.session.adminId = null;
      return res.redirect("/login/admin");
    }

    const grievances = await Grievance.find({
      category: department.name
    })
      .sort({ createdAt: -1 })
      .lean();

    const total = grievances.length;
    const resolved = grievances.filter(g => g.status === "RESOLVED").length;

    res.render("admin/dashboard", {
      department,
      grievances,
      stats: { total, resolved }
    });

  } catch (err) {
    console.error(err);
    res.redirect("/login/admin");
  }
});

/* ================= ADMIN: TAKE ACTION VIEW ================= */
app.get("/admin/grievances/:grievanceId", async (req, res) => {
  if (!req.session.adminId) {
    return res.redirect("/login/admin");
  }

  const grievance = await Grievance.findOne({
    grievanceId: req.params.grievanceId
  })
  .populate("user", "fullName employeeId email department position")
  .lean();

  if (!grievance) {
    return res.redirect("/admin/dashboard");
  }

  res.render("grievance-detail", {
    grievance,
    isAdmin: true
  });
});

/* ================= ADMIN: SUBMIT ACTION ================= */
app.post("/admin/grievances/:grievanceId/action", async (req, res) => {
  if (!req.session.adminId) {
    return res.redirect("/login/admin");
  }

  const { remark } = req.body;

  const grievance = await Grievance.findOne({
    grievanceId: req.params.grievanceId
  })



  if (!grievance) {
    return res.redirect("/admin/dashboard");
  }

  // OPEN → UNDER_REVIEW
  if (grievance.status === "OPEN") {
    grievance.status = "UNDER_REVIEW";
    grievance.reviewedAt = new Date();
  }

  // UNDER_REVIEW → RESOLVED
  else if (grievance.status === "UNDER_REVIEW") {
    grievance.status = "RESOLVED";
    grievance.resolvedAt = new Date();
    grievance.departmentComment = remark;
  }

  await grievance.save();

  res.redirect(`/admin/grievances/${grievance.grievanceId}`);
});

/* ================= USER: VIEW GRIEVANCE ================= */
app.get("/grievances/:grievanceId", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  const grievance = await Grievance.findOne({
    grievanceId: req.params.grievanceId
  })
  .populate("user", "fullName employeeId email department position")
  .lean();


  if (!grievance) {
    return res.redirect("/dashboard");
  }

  res.render("grievance-detail", {
    grievance,
    isAdmin: false
  });
});

/* ================= ADMIN CREATE DEPARTMENT ================= */
app.get("/admin/create-department", (req, res) => {
  const message = req.session.adminMessage;
  req.session.adminMessage = null;

  res.render("admin/create-department", {
    adminMessage: message
  });
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

/* ================= LOGOUT ================= */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

/* ================= TRACKING ================= */
app.get("/track", (req, res) => {
  res.render("track");
});

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
      case "OPEN":
        statusLabel = "Open";
        statusClass = "status-open";
        step = 1;
        break;
      case "UNDER_REVIEW":
        statusLabel = "Under Review";
        statusClass = "status-review";
        step = 2;
        break;
      case "RESOLVED":
        statusLabel = "Resolved";
        statusClass = "status-resolved";
        step = 3;
        break;
      case "CLOSED":
        statusLabel = "Closed";
        statusClass = "status-closed";
        step = 4;
        break;
    }

    /* ================= REAL-TIME TIMELINE ================= */
    const timeline = [];

    timeline.push(
      `${grievance.createdAt.toDateString()} – Grievance Raised`
    );

    if (grievance.reviewedAt) {
      timeline.push(
        `${grievance.reviewedAt.toDateString()} – Under Review by Department`
      );
    }

    if (grievance.resolvedAt) {
      timeline.push(
        `${grievance.resolvedAt.toDateString()} – Grievance Resolved`
      );
    }

    /* ================= RENDER ================= */
    res.render("trackstatus", {
      token: grievance.grievanceId,
      submissionDate: grievance.createdAt.toDateString(),
      lastUpdated: grievance.updatedAt.toDateString(),
      department: grievance.category,
      priority: grievance.priority.toUpperCase(),

      statusLabel,
      statusClass,
      step,

      remark: grievance.departmentComment || null,
      timeline
    });

  } catch (err) {
    console.error(err);
    res.status(500).render("track", {
      error: "Something went wrong. Please try again later."
    });
  }
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});