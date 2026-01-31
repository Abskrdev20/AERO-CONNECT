
const Grievance = require("../models/Grievance");
const generateGrievanceId = require("../utils/generateGrievanceId");

exports.createGrievance = async (req, res) => {
  try {
    const {
      category,
      subject,
      description,
      incidentDate,
      incidentTime,
      location,
      priority,
      attachments
    } = req.body;

    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 🔑 Generate unique grievance ID
    const grievanceId = await generateGrievanceId();

    const grievance = new Grievance({
      grievanceId,
      user: req.session.userId,
      empId: req.body.empId,
      category,
      subject,
      description,
      incidentDate,
      incidentTime,
      location,
      priority,
      attachments,
      status: "OPEN"
    });

    await grievance.save();

    res.status(201).json({
      success: true,
      grievanceId,
      message: "Grievance submitted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to submit grievance"
    });
  }
};

exports.getHomeStats = async (req, res) => {
  try {
    const totalGrievances = await Grievance.countDocuments();

    const resolved = await Grievance.countDocuments({
  status: "RESOLVED"
});

const inProgress = await Grievance.countDocuments({
  status: { $in: ["OPEN", "UNDER_REVIEW"] }
});



    const resolvedGrievances = await Grievance.find({
  status: "RESOLVED",
  resolvedAt: { $exists: true }
});


    let avgResolution = 0;

    if (resolvedGrievances.length > 0) {
      const totalHours = resolvedGrievances.reduce((sum, g) => {
        const diff =
          (new Date(g.resolvedAt) - new Date(g.createdAt)) /
          (1000 * 60 * 60);
        return sum + diff;
      }, 0);

      avgResolution = (totalHours / resolvedGrievances.length).toFixed(1);
    }

    res.render("home", {
      stats: {
        totalGrievances,
        resolved,
        inProgress,
        avgResolution
      }
    });
  } catch (error) {
    console.error(error);
    res.render("home", {
      stats: {
        totalGrievances: 0,
        resolved: 0,
        inProgress: 0,
        avgResolution: 0
      }
    });
  }
};
