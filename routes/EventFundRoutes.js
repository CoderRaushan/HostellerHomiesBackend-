// const express = require('express');
// const router = express.Router();
// const { EventFundRegister ,getEventFund,getEventFundBtStudentId,updateEventFundStatus} = require('../controllers/EventFundController.js');
// const IsWarden=require("../utils/IsWarden.js");
// const IsStudent = require('../utils/IsStudent.js');

// router.post('/EventFund',IsStudent,EventFundRegister);
// router.get('/EventFund/get',IsWarden, getEventFund);
// router.post("/EventFund/student/get",IsStudent ,getEventFundBtStudentId);
// router.put("/EventFund/admin/update",IsWarden, updateEventFundStatus);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  EventFundRegister,
  getEventFund,
  getEventFundBtStudentId,
  wardenAction,
  chiefAction,
} = require("../controllers/EventFundController.js");

const IsStudent = require("../utils/IsStudent.js");
const IsWarden = require("../utils/IsWarden.js");
const IsSuperAdmin = require("../utils/IsSuperAdmin.js"); // ➕ Create middleware for chief warden auth

router.post("/EventFund", IsStudent, EventFundRegister);
router.get("/EventFund/get", getEventFund);
router.post("/EventFund/student/get", IsStudent, getEventFundBtStudentId);

// 🧩 Warden approval endpoint
router.put("/EventFund/warden/action", IsWarden, wardenAction);

// 🧩 Chief Warden approval endpoint
router.put("/EventFund/chief/action", IsSuperAdmin, chiefAction);

module.exports = router;
