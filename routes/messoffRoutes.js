// // const express = require('express');
// // const router = express.Router();
// // const { check } = require('express-validator');
// // const { requestMessOff,AdminMessHistory, countMessOff, listMessOff, updateMessOff,messHistory } = require('../controllers/messoffController');
// // const IsStudent = require('../utils/IsStudent');
// // const IsManager = require('../utils/IsManager');
// // const IsButler = require("../utils/IsButler.js");

// // // @route   request api/messoff/request
// // // @desc    Request for mess off
// // // @access  Public
// // router.post('/request', [
// //     check('student', 'Student ID is required').not().isEmpty(),
// //     check('leaving_date', 'Leaving date is required').not().isEmpty(),
// //     check('return_date', 'Return date is required').not().isEmpty()
// // ], IsStudent, requestMessOff);
// // // list last month history for user
// // router.post('/history', IsStudent, messHistory);

// // router.post("/count",IsStudent,countMessOff);

// // // list last month history for admin for all users
// // router.post('/admin/history', IsButler, AdminMessHistory);

// // // @route   POST list requests api/messoff/list
// // router.post('/list', IsButler, listMessOff);

// // // @route   POST update request api/messoff/update
// // // @desc    Update mess off request
// // // @access  Public
// // router.post('/update', [
// //     check('id', 'ID is required').not().isEmpty(),
// //     check('status', 'Status is required').not().isEmpty()
// // ], IsButler, updateMessOff);

// // module.exports = router;
// // const express = require('express');
// // const router = express.Router();
// // const { check } = require('express-validator');
// // const IsStudent = require('../utils/IsStudent');
// // const IsButler = require('../utils/IsButler');
// // const {
// //   requestMessOff,
// //   requestMessOn,
// //   messHistory,
// //   messStatus,
// //   updateMessOff,
// //   // ... other exports
// // } = require('../controllers/messoffController');

// // // request off (leaving_date only)
// // router.post('/request', [
// //   check('student','Student ID is required').not().isEmpty(),
// //   check('leaving_date','Leaving date is required').not().isEmpty()
// // ], IsStudent, requestMessOff);

// // // request on (return_date) — student uses when they want to re-open mess
// // router.post('/on', [
// //   check('student','Student ID is required').not().isEmpty(),
// //   check('return_date','Return date is required').not().isEmpty()
// // ], IsStudent, requestMessOn);

// // // history & status & count
// // router.post('/history', IsStudent, messHistory);
// // router.post('/status', IsStudent, messStatus);

// // // admin update remains same route: update status (butler/admin)
// // router.post('/update', [
// //   check('id','ID is required').not().isEmpty(),
// //   check('status','Status is required').not().isEmpty()
// // ], IsButler, updateMessOff);

// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// const { check } = require('express-validator');
// const IsStudent = require('../utils/IsStudent');
// const IsButler = require('../utils/IsButler');

// const {
//   requestMessOff,
//   requestMessOn,
//   messHistory,
//   messStatus,
//   updateMessOff,
//   listMessOff,
//   AdminMessHistory,
//   countMessOff,
// } = require('../controllers/messoffController');

// // student routes
// router.post(
//   '/request',
//   [check('student','Student ID is required').not().isEmpty(), check('leaving_date','Leaving date is required').not().isEmpty()],
//   IsStudent,
//   requestMessOff
// );

// router.post(
//   '/on',
//   [check('student','Student ID is required').not().isEmpty(), check('return_date','Return date is required').not().isEmpty()],
//   IsStudent,
//   requestMessOn
// );

// router.post('/history', IsStudent, messHistory);
// router.post('/status', IsStudent, messStatus);
// router.post('/count', IsStudent, countMessOff);

// // admin/butler routes
// router.post('/list', IsButler, listMessOff); // used by frontend: /api/messoff/list
// router.post('/admin/history', IsButler, AdminMessHistory); // used by frontend: /api/messoff/admin/history

// // admin update remains same route: update status (butler/admin)
// router.post(
//   '/update',
//   [check('id','ID is required').not().isEmpty(), check('status','Status is required').not().isEmpty()],
//   IsButler,
//   updateMessOff
// );

// module.exports = router;
// routes/messoff.js
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
