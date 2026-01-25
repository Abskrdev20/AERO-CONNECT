const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    // ✅ Role ko fields wale object ke andar hi rakha gaya hai
    role: {
      type: String,
      enum: ['DEPARTMENT', 'SUPERADMIN'],
      default: 'DEPARTMENT'
    }
  },
  { timestamps: true } // ✅ Options (timestamps) alag object mein hain
);

module.exports = mongoose.model("Department", departmentSchema);