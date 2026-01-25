const Department = require("../models/Department");
const Grievance = require("../models/Grievance");
const bcrypt = require("bcrypt");

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

// ✅ NEW: Logic for Super Admin Analytics & Dashboard
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    // 1. Fetch ALL grievances for the global view
    const grievances = await Grievance.find().sort({ createdAt: -1 }).lean();
    
    // 2. Calculate Statistics
    const stats = {
      total: grievances.length,
      resolved: grievances.filter(g => g.status === "RESOLVED").length,
      pending: grievances.filter(g => g.status === "OPEN" || g.status === "UNDER_REVIEW").length,
      escalated: grievances.filter(g => g.isEscalated === true).length
    };

    // 3. Prepare Data for Pie Chart (Count by Department Name)
    const categoryCounts = {};
    grievances.forEach(g => {
      categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1;
    });

    // 4. Render the special Super Dashboard
    res.render("admin/super-dashboard", {
      stats,
      grievances,
      chartData: {
        labels: Object.keys(categoryCounts),
        counts: Object.values(categoryCounts)
      },
      department: { name: "Super Admin" }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading Super Admin dashboard");
  }
};