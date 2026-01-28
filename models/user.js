const mongoose = require("mongoose");
const bcrypt = require("bcrypt");



const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^[\w-\.]+@aai\.aero$/, "Only AAI official email allowed"]
    },
    recoveryEmail: {
      type: String,
      lowercase: true,
      trim: true
    },

    mobile: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Invalid mobile number"]
    },

    position: {
      type: String,
      required: true,
      enum: [
        "Intern",
        "Apprentice",
        "Junior_Executive",
        "Senior_Manager",
        "Assistant_Manager",
        "Technician",
        "Joint_General_Manager",
        "Direct_General_Manager"
      ]
    },

    department: {
      type: String,
      required: true,
      enum: ["Operations", "IT", "ATM","HR","Finance","Engg. Civil", "Engg. Electrical", "Security", "Commercial", "Hindi","Law"]
    },

    password: {
      type: String,
      required: true
    },
    
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },


    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


module.exports = mongoose.model("User", userSchema);