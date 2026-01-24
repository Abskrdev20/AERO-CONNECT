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

const Grievance = require("../models/Grievance");

router.get("/:grievanceId", async (req, res) => {
  try {
    if (!req.session.userId) {
    return res.redirect("/login");
   }

   const grievance = await Grievance.findOne({
    grievanceId: req.params.grievanceId
   }).lean();

   if (!grievance) {
    return res.redirect("/dashboard");
   }

   res.render("grievance-detail", {
    grievance,
    isAdmin: false
   });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
