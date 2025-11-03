const express = require("express");
const router = express.Router();
const {
  initRooms,
  getAllRooms,
  getEmptyRooms,
  getOccupiedRooms,
  allotRoom,
} = require("../controllers/roomController");

// ✅ Initialize once
router.post("/init", initRooms);

// ✅ Get all rooms (occupied + empty)
router.get("/all", getAllRooms);

// ✅ Get only empty rooms
router.get("/empty", getEmptyRooms);

// ✅ Get only occupied rooms
router.get("/occupied", getOccupiedRooms);

// ✅ Manually allot a room (if needed)
router.post("/allot", allotRoom);

module.exports = router;
