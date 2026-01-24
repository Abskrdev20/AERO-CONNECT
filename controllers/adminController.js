const Department = require("../models/Department");
const bcrypt = require("bcrypt");

exports.createDepartment = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // basic validation
    if (!name || !email || !password) {
      req.session.adminMessage = "All fields are required";
      return res.redirect("/admin/create-department");
    }

    // check existing department
    const exists = await Department.findOne({
      $or: [{ name }, { email }]
    });

    if (exists) {
      req.session.adminMessage = "Department already exists";
      return res.redirect("/admin/create-department");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await Department.create({
      name,
      email,
      password: hashedPassword
    });

    // success message
    req.session.adminMessage = "Department created successfully";
    res.redirect("/admin/create-department");

  } catch (err) {
    console.error(err);
    req.session.adminMessage = "Something went wrong";
    res.redirect("/admin/create-department");
  }
};
