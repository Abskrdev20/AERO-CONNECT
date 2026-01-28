const Department = require("../models/Department");
const Grievance = require("../models/Grievance");
const bcrypt = require("bcrypt");

/**
 * Creates a new department or admin account
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
    console.error(err);
    req.session.adminMessage = "Error creating account";
    res.redirect("/admin/create-department");
  }
};

/**
 * Fetches data for the Super Admin Dashboard
 */
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    // ====================================================
    // ✅ AUTO-ESCALATION LOGIC (Start)
    // ====================================================
    const SLA_DAYS = 20; 
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - SLA_DAYS);

    // Find and update all tickets older than 20 days
    await Grievance.updateMany(
      {
        createdAt: { $lt: thresholdDate },          // Created before 20 days ago
        status: { $in: ['OPEN', 'UNDER_REVIEW'] },  // Still pending
        isEscalated: false                          // Not yet escalated
      },
      {
        $set: {
          isEscalated: true,
          escalationReason: `Automatic Escalation: Unresolved for ${SLA_DAYS}+ days`,
          escalatedBy: 'SYSTEM',
          escalationDate: new Date()
        }
      }
    );
    // ====================================================
    // ✅ AUTO-ESCALATION LOGIC (End)
    // ====================================================

    // ✅ FIXED: You must fetch grievances before using them!
    const grievances = await Grievance.find().sort({ createdAt: -1 }).lean();

    // Fetch all department accounts
    const departments = await Department.find().sort({ createdAt: -1 }).lean();

    const stats = {
      total: grievances.length,
      resolved: grievances.filter(g => g.status === "RESOLVED").length,
      pending: grievances.filter(g => g.status === "OPEN" || g.status === "UNDER_REVIEW").length,
      escalated: grievances.filter(g => g.isEscalated === true).length
    };

    const categoryCounts = {};
    grievances.forEach(g => {
      categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
    });

    res.render("admin/super-dashboard", {
      stats,
      grievances,
      departments,
      chartData: {
        labels: Object.keys(categoryCounts),
        counts: Object.values(categoryCounts)
      },
      department: { name: "Super Admin" }
    });
  } catch (err) {
    console.error("Super Admin Dashboard Error:", err);
    res.status(500).send("Error loading dashboard data");
  }
};

/**
 * ✅ NEW: Deletes a department/admin account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Security check: Prevent the logged-in Super Admin from deleting themselves
    if (req.session.adminId && req.session.adminId.toString() === id) {
      return res.status(400).send("Security Alert: You cannot delete your own administrative account.");
    }

    const deleted = await Department.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).send("Account not found.");
    }

    // Redirect back to the dashboard to see the updated list
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Delete Account Error:", err);
    res.status(500).send("Failed to delete the administrative account.");
  }
};

/**
 * ✅ SUPER ADMIN: Resolve Escalated Grievance
 */
exports.resolveEscalatedGrievance = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (req.session.role !== 'SUPERADMIN') {
      return res.status(403).send("Unauthorized");
    }

    await Grievance.findByIdAndUpdate(id, {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      departmentComment: `[SUPER ADMIN INTERVENTION]: ${comment}`,
      isEscalated: false
    });

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};