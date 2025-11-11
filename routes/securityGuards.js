
const express = require("express");
const router = express.Router();
const guardController = require("../controllers/securityGuardController.js");
const IsCaretaker = require("../utils/IsCaretaker.js");
const IsGuard = require("../utils/IsGuard.js");
const IsSecurityIncharge = require("../utils/IsSecurityIncharge.js");

router.get("/", guardController.getAllGuards);
router.post("/guardbyid", guardController.getGuardById);
router.put("/update/:id", IsSecurityIncharge, guardController.updateGuard);


module.exports = router;