const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { requestMessOff,AdminMessHistory, countMessOff, listMessOff, updateMessOff,messHistory } = require('../controllers/messoffController');
const IsStudent = require('../utils/IsStudent');
const IsManager = require('../utils/IsManager');

// @route   request api/messoff/request
// @desc    Request for mess off
// @access  Public
router.post('/request', [
    check('student', 'Student ID is required').not().isEmpty(),
    check('leaving_date', 'Leaving date is required').not().isEmpty(),
    check('return_date', 'Return date is required').not().isEmpty()
], IsStudent, requestMessOff);
// list last month history for user
router.post('/history', IsStudent, messHistory);

router.post("/count",IsStudent,countMessOff);

// list last month history for admin for all users
router.post('/admin/history', IsManager, AdminMessHistory);

// @route   POST list requests api/messoff/list
router.post('/list', IsManager, listMessOff);

// @route   POST update request api/messoff/update
// @desc    Update mess off request
// @access  Public
router.post('/update', [
    check('id', 'ID is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty()
], IsManager, updateMessOff);

module.exports = router;