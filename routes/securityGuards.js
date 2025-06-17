// // routes/securityGuards.js

// const express = require('express');
// const router = express.Router();
// const {
//   getAllGuards,
//   setGuardOnDuty,
// } = require('../controllers/securityGuardController');

// router.get('/guards', getAllGuards);
// router.put('/guards/on-duty', setGuardOnDuty);

// module.exports = router;
// // http://localhost:3000/api/guard/guards/on-duty
const express = require("express");
const router = express.Router();
const guardController = require("../controllers/securityGuardController");

router.get("/", guardController.getAllGuards);
router.post("/add", guardController.addGuard);
router.put("/update/:id", guardController.updateGuard);
router.delete("/delete/:id", guardController.deleteGuard);

module.exports = router;