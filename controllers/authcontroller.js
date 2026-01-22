const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.registerUser = async (req, res) => {
  try {
    const {
      fullName,
      employeeId,
      email,
      mobile,
      position,
      department,
      password
    } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { employeeId }]
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
      email,
      mobile,
      position,
      department,
      password // (we’ll hash later)
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

exports.loginUser = async (req, res) => {
  try {
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

    const isMatch = await bcrypt.compare(password, user.password);

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
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


