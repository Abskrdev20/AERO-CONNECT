const User = require("../models/User");
const bcrypt = require("bcrypt");

/* ================= REGISTER ================= */
const crypto = require("crypto");
const transporter = require("../config/mailer");


exports.registerUser = async (req, res) => {
  try {
    /* 1️⃣ CAPTCHA VALIDATION (FIRST) */
    const userCaptcha = req.body.captcha;
    const sessionCaptcha = req.session.captcha;

    if (
      !userCaptcha ||
      !sessionCaptcha ||
      userCaptcha.toUpperCase() !== sessionCaptcha
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired security code"
      });
    }

    // one-time use
    req.session.captcha = null;

    /* 2️⃣ NORMAL REGISTER LOGIC */
    const {
      fullName,
      employeeId,
      email,
      recoveryEmail,
      mobile,
      position,
      department,
      password
    } = req.body;

    const userExists = await User.findOne({
      $or: [{ email:email.toLowerCase() }, { employeeId }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const newUser = new User({
      fullName,
      employeeId,
      email: email.toLowerCase(),
      recoveryEmail: recoveryEmail?.toLowerCase(),
      mobile,
      position,
      department,
      password
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* ================= LOGIN ================= */
exports.loginUser = async (req, res) => {
  try {
    /* 1️⃣ CAPTCHA VALIDATION (FIRST) */
    const userCaptcha = req.body.captcha;
    const sessionCaptcha = req.session.captcha;

    if (
      !userCaptcha ||
      !sessionCaptcha ||
      userCaptcha.toUpperCase() !== sessionCaptcha
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired security code"
      });
    }

    // one-time use
    req.session.captcha = null;

    /* 2️⃣ NORMAL LOGIN LOGIC */
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare( req.body.password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    req.session.userId = user._id;

    res.status(200).json({
      success: true,
      message: "Login successful"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, employeeId } = req.body;

    // 🔹 Find user by email + employeeId
    const user = await User.findOne({ email: email.toLowerCase(), employeeId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 🔹 Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // 🔹 Save token + expiry in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // 🔹 Determine recipient: secondary email if present
    const sendTo = user.recoveryEmail?.trim() || user.email;

    console.log("FORGOT PASSWORD → sending to:", sendTo);

    // 🔹 Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sendTo,
      subject: "Password Reset - AeroConnect",
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${user.fullName},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <a href="${`http://localhost:8080/auth/reset-password/${resetToken}`}">${`http://localhost:8080/auth/reset-password/${resetToken}`}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    console.log("FORGOT PASSWORD → mail sent successfully");

    // 🔹 Send response back to frontend
    return res.status(200).json({ success: true, message: "Password reset link sent to your email" });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR 👉", err);
    return res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};


// ---------------------- RESET PASSWORD ----------------------
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    // Update password (pre-save hook in model will hash it)
    user.password = req.body.password;

    // Clear token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).redirect("/login");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};