// routes/billRoutes.js
const express = require("express");
const router = express.Router();
const billCtrl = require("../controllers/billController.js");

router.post("/student", billCtrl.getBillForStudent);
// NEW: get hostel-level table rows (butler)
router.post("/hostel", billCtrl.getBillsForHostel);
module.exports = router;
