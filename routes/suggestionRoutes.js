// const express = require('express');
// const router = express.Router();
// const { check } = require('express-validator');
// const { registerSuggestion,getTodayCount,getHistory,getMonthlyHistoryforadmin, getbyhostel, getbystudent, updateSuggestion } = require('../controllers/suggestionController');
// const IsManager = require('../utils/IsManager');
// const IsStudent = require('../utils/IsStudent');

// // @route   Register api/suggestion
// // @desc    Register suggestion
// // @access  Public
// router.post('/register', [
//     check('student', 'Student is required').not().isEmpty(),
//     check('hostel', 'Hostel is required').not().isEmpty(),
//     check('title', 'Title is required').not().isEmpty(),
//     check('description', 'Description is required').not().isEmpty()
// ], IsStudent, registerSuggestion);

// // @route   GET api/suggestion
// // @desc    Get all suggestions by hostel id
// // @access  Public
// router.post('/hostel', IsManager, getbyhostel);

// // router.post('/register', registerSuggestion);
// router.get('/count', getTodayCount);
// router.get('/history', IsStudent, getHistory);
// router.get("/admin/history", IsManager, getMonthlyHistoryforadmin);


// // @route   GET api/suggestion
// // @desc    Get all suggestions by student id
// // @access  Public
// router.post('/student', [
//     check('student', 'Student is required').not().isEmpty()
// ], getbystudent);

// // @route Update api/suggestion
// // @desc Update suggestion
// // @access Public
// router.post('/update', [
//     check('id', 'Id is required').not().isEmpty(),
//     check('status', 'Status is required').not().isEmpty()
// ], updateSuggestion);

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const { check } = require("express-validator");
// const {
//   registerSuggestion,
//   getTodayCount,
//   getHistory,
//   getHostelSuggestions,
//   getMessSuggestions,
//   getMonthlyHistoryforadmin,
//   getbystudent,
//   updateSuggestion,
// } = require("../controllers/suggestionController");
// const IsManager = require("../utils/IsManager");
// const IsStudent = require("../utils/IsStudent");
// const IsCaretaker = require("../utils/IsCaretaker");

// // Student
// router.post(
//   "/register",
//   [
//     check("student", "Student is required").not().isEmpty(),
//     check("hostel", "Hostel is required").not().isEmpty(),
//     check("title", "Title is required").not().isEmpty(),
//     check("description", "Description is required").not().isEmpty(),
//     check("suggestionFor", "Please select Hostel or Mess").not().isEmpty(),
//   ],
//   IsStudent,
//   registerSuggestion
// );

// // Daily count & history
// router.get("/count", getTodayCount);
// router.get("/history", IsStudent, getHistory);

// // Role-based suggestion views
// router.post("/hostel-suggestions", IsCaretaker, getHostelSuggestions);
// router.post("/mess-suggestions", IsManager, getMessSuggestions);

// // Admin / Manager full history
// router.get("/admin/history", IsManager, getMonthlyHistoryforadmin);

// // Student view
// router.post(
//   "/student",
//   [check("student", "Student is required").not().isEmpty()],
//   getbystudent
// );

// // Update
// router.post(
//   "/update",
//   [
//     check("id", "Id is required").not().isEmpty(),
//     check("status", "Status is required").not().isEmpty(),
//   ],
//   updateSuggestion
// );

// module.exports = router;


const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

// ✅ Import all controller functions
const {
  registerSuggestion,
  getTodayCount,
  getHistory,
  getHostelSuggestions,
  getMessSuggestions,
  getMonthlyHistoryforadmin,
  getbystudent,
  updateSuggestion,
  getHostelSuggestionHistory, // ✅ new
  getMessSuggestionHistory,   // ✅ new
} = require("../controllers/suggestionController");

// ✅ Import role middlewares
const IsManager = require("../utils/IsManager");
const IsStudent = require("../utils/IsStudent");
const IsCaretaker = require("../utils/IsCaretaker");

// ==========================================================
// 📌 STUDENT ROUTES
// ==========================================================

// ➕ Register new suggestion (Hostel / Mess)
router.post(
  "/register",
  [
    check("student", "Student is required").not().isEmpty(),
    check("hostel", "Hostel is required").not().isEmpty(),
    check("title", "Title is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("suggestionFor", "Please select Hostel or Mess").not().isEmpty(),
  ],
  IsStudent,
  registerSuggestion
);

// 🔹 Get today’s count (optionally filtered by suggestionFor)
router.get("/count", getTodayCount);

// 🔹 Get last 1-month history (for that student)
router.get("/history", IsStudent, getHistory);

// ==========================================================
// 📌 CARETAKER ROUTES
// ==========================================================

// 🔹 Get all current Hostel suggestions (pending)
router.post("/hostel-suggestions", IsCaretaker, getHostelSuggestions);

// 🔹 Get last 1-month Hostel suggestions history ✅
router.post("/hostel-suggestions-history", IsCaretaker, getHostelSuggestionHistory);

// ==========================================================
// 📌 MANAGER ROUTES
// ==========================================================

// 🔹 Get all current Mess suggestions (pending)
router.post("/mess-suggestions", IsManager, getMessSuggestions);

// 🔹 Get last 1-month Mess suggestions history ✅
router.get("/mess-suggestions-history", IsManager, getMessSuggestionHistory);

// 🔹 Admin / Manager full 1-month history (global)
router.get("/admin/history", IsManager, getMonthlyHistoryforadmin);

// ==========================================================
// 📌 ADMIN / COMMON ROUTES
// ==========================================================

// 🔹 Get all suggestions by a specific student
router.post(
  "/student",
  [check("student", "Student is required").not().isEmpty()],
  getbystudent
);

// 🔹 Update suggestion status (Approve / Deny)
router.post(
  "/update",
  [
    check("id", "Id is required").not().isEmpty(),
    check("status", "Status is required").not().isEmpty(),
  ],
  updateSuggestion
);

module.exports = router;
