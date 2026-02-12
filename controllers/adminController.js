const Department = require("../models/Department");
const Grievance = require("../models/Grievance");
const bcrypt = require("bcrypt");

/**
 * 1. CREATE ACCOUNT (Super Admin only)
 * Provisions new Department or Super Admin accounts
 */
exports.createDepartment = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      req.session.adminMessage = "All fields are required";
      return res.redirect("/admin/create-department");
    }

    const exists = await Department.findOne({ $or: [{ name }, { email }] });
    if (exists) {
      req.session.adminMessage = "Admin/Department already exists";
      return res.redirect("/admin/create-department");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Department.create({ name, email, password: hashedPassword, role });

    req.session.adminMessage = `${role} created successfully`;
    res.redirect("/admin/create-department");
  } catch (err) {
    console.error("Create Department Error:", err);
    req.session.adminMessage = "Error creating account";
    res.redirect("/admin/create-department");
  }
};

/**
 * 2. SUPER ADMIN DASHBOARD
 * Central oversight, Analytics (30 days), and SLA Breach monitoring
 */
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    // --- AUTO-ESCALATION LOGIC ---
    const SLA_DAYS = 20;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - SLA_DAYS);

    await Grievance.updateMany(
      {
        createdAt: { $lt: thresholdDate },
        status: { $in: ["OPEN", "UNDER_REVIEW"] },
        isEscalated: false,
      },
      {
        $set: {
          isEscalated: true,
          escalationDate: new Date(),
        },
      },
    );

    const grievances = await Grievance.find().sort({ createdAt: -1 }).lean();
    const departments = await Department.find().sort({ createdAt: -1 }).lean();

    const stats = {
      total: grievances.length,
      resolved: grievances.filter((g) => g.status === "RESOLVED").length,
      pending: grievances.filter(
        (g) => g.status === "OPEN" || g.status === "UNDER_REVIEW",
      ).length,
      escalated: grievances.filter((g) => g.isEscalated === true).length,
    };

    // Prepare Category Counts for Analytics
    const categoryCounts = {};
    grievances.forEach((g) => {
      categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
    });

    res.render("admin/super-dashboard", {
      stats,
      grievances,
      departments,
      chartData: {
        labels: Object.keys(categoryCounts),
        counts: Object.values(categoryCounts),
      },
      department: { name: "Super Admin" },
    });
  } catch (err) {
    console.error("Super Admin Dashboard Error:", err);
    res.status(500).send("Error loading super admin dashboard");
  }
};

/**
 * 3. DEPARTMENT ADMIN DASHBOARD
 * Specific views for Department-level admins
 */
exports.getDepartmentDashboard = async (req, res) => {
  try {
    const admin = await Department.findById(req.session.adminId).lean();
    if (!admin) return res.redirect("/login/admin");

    const grievances = await Grievance.find({ category: admin.name })
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      total: grievances.length,
      resolved: grievances.filter(
        (g) => g.status === "RESOLVED" || g.status === "CLOSED",
      ).length,
      pending: grievances.filter(
        (g) => g.status === "OPEN" || g.status === "UNDER_REVIEW",
      ).length,
    };

    res.render("admin/dashboard", {
      department: admin,
      grievances,
      stats,
    });
  } catch (err) {
    console.error("Department Dashboard Error:", err);
    res.status(500).send("Error loading dashboard");
  }
};

/**
 * 4. DELETE ACCOUNT
 * Permanent removal of admin/department access
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.session.adminId && req.session.adminId.toString() === id) {
      return res
        .status(400)
        .send(
          "Security Alert: You cannot delete your own administrative account.",
        );
    }
    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) return res.status(404).send("Account not found.");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Delete Account Error:", err);
    res.status(500).send("Failed to delete the administrative account.");
  }
};

/**
 * 5. RESOLVE ESCALATION
 * Super Admin intervention for breached tickets
 */
exports.resolveEscalatedGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    if (req.session.role !== "SUPERADMIN")
      return res.status(403).send("Unauthorized");

    await Grievance.findByIdAndUpdate(id, {
      status: "RESOLVED",
      resolvedAt: new Date(),
      departmentComment: `[SUPER ADMIN INTERVENTION]: ${comment}`,
      isEscalated: false,
    });

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Resolve Escalation Error:", err);
    res.status(500).send("Server Error");
  }
};

/**
 * 6. FORWARD GRIEVANCE
 * Redirects ticket to another department with internal note
 */
exports.forwardGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const { newCategory, remark } = req.body;

    const grievance = await Grievance.findOne({ grievanceId: id });
    if (!grievance) return res.status(404).send("Grievance not found");

    await Grievance.findOneAndUpdate(
      { grievanceId: id },
      {
        forwardedFrom: grievance.category,
        category: newCategory,
        status: "OPEN",
        isForwarded: true,
        forwardedAt: new Date(),
        forwardingRemark: `Forwarded from ${grievance.category}: ${remark}`,
        departmentComment: "", // Clear resolution box for the new department
      },
    );

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Forwarding Error:", err);
    res.status(500).send("Error occurred in forwarding Grievance");
  }
};
