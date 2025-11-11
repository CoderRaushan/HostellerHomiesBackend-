const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { registerStudent, getStudent, getAllStudents, updateStudent, deleteStudent, csvStudent,getStudentsById } = require('../controllers/studentController');
const IsCaretaker = require('../utils/IsCaretaker.js');
// @route  POST api/student/register-student
// @desc   Register student
// @access Public
router.post('/register-student',IsCaretaker, registerStudent);

// @route  POST api/student/get-student
// @desc   Get student by urn 
// @access Public
router.post('/get-student', [
    check('isAdmin', 'isAdmin is required').notEmpty(),
    check('token', 'You donot have a valid token').notEmpty()
], getStudent);

// @route  POST api/student/get-all-students
// @access Public
router.post('/get-all-students',[
    check('hostel', 'Hostel is required').not().isEmpty()
],
 getAllStudents);

router.get('/getStudentsById/:id', [
    check('id', 'ID is required').not().isEmpty(),
], getStudentsById);

// @route  POST api/student/update-student
// @desc   Update student
// @access Public
router.put('/update-student/:id', [
    check('urn', 'urn is required').not().isEmpty(),
    check('room_no', 'Room number is required').not().isEmpty(),
    check('batch', 'Batch is required').not().isEmpty(),
    check('dept', 'Department is required').not().isEmpty(),
    check('course', 'Course is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('father_name', 'Father name is required').not().isEmpty(),
    check('contact', 'Contact is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('dob', 'Date of birth is required').not().isEmpty(),
    check('uidai', 'uidai is required').not().isEmpty(),
    check('user', 'User is required').not().isEmpty(),
    check('hostel', 'Hostel is required').not().isEmpty()
], IsCaretaker, updateStudent);

// @route  POST api/student/delete-student
// @desc   Delete student
// @access Public
router.delete('/delete-student', [
    check('id', 'Enter a valid ID').not().isEmpty(),
], IsCaretaker, deleteStudent);

// @route  POST api/student/csv
// @desc   Get CSV of students
// @access Public
router.post('/csv', IsCaretaker, csvStudent);


module.exports = router;

