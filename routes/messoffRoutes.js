
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const IsStudent = require('../utils/IsStudent');
const IsButler = require('../utils/IsButler');

const {
  requestMessOff,
  requestMessOn,
  messHistory,
  messStatus,
  updateMessOff,
  listMessOff,
  AdminMessHistory,
  countMessOff,
} = require('../controllers/messoffController');

// student routes
router.post(
  '/request',
  [check('student','Student ID is required').not().isEmpty(), check('leaving_date','Leaving date is required').not().isEmpty()],
  IsStudent,
  requestMessOff
);

router.post(
  '/on',
  [check('student','Student ID is required').not().isEmpty(), check('return_date','Return date is required').not().isEmpty()],
  IsStudent,
  requestMessOn
);

router.post('/history', IsStudent, messHistory);
router.post('/status', IsStudent, messStatus);
router.post('/count', IsStudent, countMessOff);

// admin/butler routes
router.post('/list', IsButler, listMessOff); // used by frontend: /api/messoff/list
router.post('/admin/history', IsButler, AdminMessHistory); // used by frontend: /api/messoff/admin/history

// admin update remains same route: update status (butler/admin)
router.post(
  '/update',
  [check('id','ID is required').not().isEmpty(), check('status','Status is required').not().isEmpty()],
  IsButler,
  updateMessOff
);

module.exports = router;
