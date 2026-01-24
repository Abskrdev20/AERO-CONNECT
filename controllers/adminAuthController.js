const Department = require("../models/Department");
const bcrypt = require("bcrypt");

exports.adminLogin = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    // CAPTCHA check
    if (
      !captcha ||
      !req.session.captcha ||
      captcha.toUpperCase() !== req.session.captcha
    ) {
      req.session.captcha = null;
      return res.status(400).json({
        success: false,
        message: "Invalid security code"
      });
    }

    req.session.captcha = null;

    const department = await Department.findOne({
      email: email.toLowerCase()
    });

    if (!department) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, department.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // ✅ ADMIN SESSION
    req.session.adminId = department._id;

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
