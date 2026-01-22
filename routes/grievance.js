const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const grievanceController = require("../controllers/grievanceController");

// upload attachments
router.post("/upload", upload.array("attachments", 5), (req, res) => {
  const files = req.files.map(file => ({
    url: file.path,
    public_id: file.filename,
    resource_type: file.resource_type
  }));

  res.json({ success: true, files });
});

// save grievance (NO grievance number yet)
router.post("/submit", grievanceController.createGrievance);

module.exports = router;
