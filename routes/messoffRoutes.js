const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { requestMessOff,AdminMessHistory, countMessOff, listMessOff, updateMessOff,messHistory } = require('../controllers/messoffController');

// @route   request api/messoff/request
// @desc    Request for mess off
// @access  Public
router.post('/request', [
    check('student', 'Student ID is required').not().isEmpty(),
    check('leaving_date', 'Leaving date is required').not().isEmpty(),
    check('return_date', 'Return date is required').not().isEmpty()
], requestMessOff);
// list last month history for user
router.post('/history', messHistory);

// list last month history for admin for all users
router.post('/admin/history', AdminMessHistory);

// @route   GET list of request api/messoff/list
// @desc    Get all mess off requests
// @access  Public
router.post('/list', [
    check('hostel', 'Hostel is required').not().isEmpty()
], listMessOff);

// @route   POST update request api/messoff/update
// @desc    Update mess off request
// @access  Public
router.post('/update', [
    check('id', 'ID is required').not().isEmpty(),
    check('status', 'Status is required').not().isEmpty()
], updateMessOff);

module.exports = router;