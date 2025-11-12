const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { registerComplaint, getbyhostel, getbystudent, resolve } = require('../controllers/complaintController');
const IsManager = require('../utils/IsManager');
const IsStudent = require('../utils/IsStudent');

// @route   Register api/compalint/register
// @desc    Register complaint
// @access  Public
router.post('/register',IsStudent, registerComplaint);

// @route   GET api/complaint/hostel
// @desc    Get all complaints by hostel id
// @access  Public
router.post('/hostel', [
    check('hostel', 'Hostel is required').not().isEmpty()
], IsManager, getbyhostel);

// @route   GET api/complaint/student
// @desc    Get all complaints by student id
// @access  Public
router.post('/student', getbystudent);

// @route   GET api/complaint/resolve
// @desc    Get complaint by complaint id
// @access  Public
router.post('/resolve', [
    check('id', 'Complaint id is required').not().isEmpty()
], resolve);


module.exports = router;