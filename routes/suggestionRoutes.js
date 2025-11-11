const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { registerSuggestion,getTodayCount,getHistory,getMonthlyHistoryforadmin, getbyhostel, getbystudent, updateSuggestion } = require('../controllers/suggestionController');
const IsManager = require('../utils/IsManager');
const IsStudent = require('../utils/IsStudent');

// @route   Register api/suggestion
// @desc    Register suggestion
// @access  Public
router.post('/register', [
    check('student', 'Student is required').not().isEmpty(),
    check('hostel', 'Hostel is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
], IsStudent, registerSuggestion);

// @route   GET api/suggestion
// @desc    Get all suggestions by hostel id
// @access  Public
router.post('/hostel', IsManager, getbyhostel);

// router.post('/register', registerSuggestion);
router.get('/count', getTodayCount);
router.get('/history', IsStudent, getHistory);
router.get("/admin/history", IsManager, getMonthlyHistoryforadmin);


// @route   GET api/suggestion
// @desc    Get all suggestions by student id
// @access  Public
router.post('/student', [
    check('student', 'Student is required').not().isEmpty()
], getbystudent);

// @route Update api/suggestion
// @desc Update suggestion
// @access Public
router.post('/update', [
    check('id', 'Id is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty()
], updateSuggestion);

module.exports = router;