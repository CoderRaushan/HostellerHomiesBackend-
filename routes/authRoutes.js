const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { login,DeleteStaff,DeleteGuard,UpdateGuard,UpdateStaff,getAllStaffDetails,getAllStaffDetailsbySecurityInch,CreateStaff, changePassword, verifySession, CreateGuard } = require('../controllers/authController.js');
const IsSuperAdmin = require('../utils/IsSuperAdmin.js');
const IsSecurityIncharge=require("../utils/IsSecurityIncharge.js");
router.post('/login', login);
router.post('/create-staff',IsSuperAdmin, CreateStaff);
router.post('/update-staff', IsSuperAdmin, UpdateStaff);//CreateGuard
router.post('/create-guard',IsSecurityIncharge, CreateGuard);
router.post('/update-guard',IsSecurityIncharge, UpdateGuard);
router.post('/delete-guard',IsSecurityIncharge, DeleteGuard);
router.get('/securityinch/get-all-staff-details',IsSecurityIncharge, getAllStaffDetailsbySecurityInch);
router.post('/get-all-staff-details',IsSuperAdmin, getAllStaffDetails);
router.post('/delete-staff', IsSuperAdmin, DeleteStaff);
router.post('/change-password', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Old password is required').isLength({ min: 8 }),
    check('newPassword', 'New password of more than 8 character is required').isLength({ min: 8 })
], changePassword);

router.post('/verifysession', [
    check('token', 'Token is required').not().isEmpty()
], verifySession);



module.exports = router;
