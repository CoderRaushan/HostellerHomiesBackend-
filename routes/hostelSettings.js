// routes/hostelSettings.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/hostelSettingsController");

// OPTIONAL auth middleware: only butler/admin should update
// const { authMiddleware, butlerOnly } = require("../middleware/auth");

router.get("/", /* authMiddleware, butlerOnly, */ ctrl.getSettings);
router.put("/:hostelNo", /* authMiddleware, butlerOnly, */ ctrl.upsertSettings);

module.exports = router;
