const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  resource_type: String
});

const grievanceSchema = new mongoose.Schema(
  {
    grievanceId: {
      type: String,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    empId: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    incidentDate: Date,
    incidentTime: String,
    location: String,
    priority: {
      type: String,
      required: true,
      enum: ["request","low","medium","high"]
    },
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: ["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"],
      default: "OPEN"
    },
    isEscalated: { type: Boolean, default: false },
    escalationReason: { type: String, default: null },
    escalatedBy: { type: String, default: null }, // Will store "SYSTEM"
    escalationDate: { type: Date, default: null },
    departmentComment: String,
    reviewedAt: Date,
    resolvedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grievance", grievanceSchema);