const express = require("express");
const router = express.Router();
const { createDepartment, deleteAccount } = require("../controllers/adminController");

// Route to handle account creation
router.post("/create-department", createDepartment);

// ✅ NEW: Route to handle account deletion (Matches the form in Canvas)
router.post("/accounts/:id/delete", deleteAccount);

module.exports = router;