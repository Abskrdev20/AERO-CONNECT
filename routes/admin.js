const express = require("express");
const router = express.Router();

// ✅ Import the controller functions (Make sure resolveEscalatedGrievance is included)
const { 
  createDepartment, 
  deleteAccount, 
  resolveEscalatedGrievance 
} = require("../controllers/adminController");

// Route to handle account creation
router.post("/create-department", createDepartment);

// Route to handle account deletion
router.post("/accounts/:id/delete", deleteAccount);

// ✅ NEW: Route for Super Admin to resolve tickets
// This listens for the form submission from your Super Admin Dashboard
router.post("/resolve-escalation/:id", resolveEscalatedGrievance);

module.exports = router;