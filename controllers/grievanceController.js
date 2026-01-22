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
