// routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const reqCtrl = require('../controllers/requestController');

router.post('/create', reqCtrl.createRequest);
router.get('/student/:studentId', reqCtrl.getRequestsByStudent);
router.get('/pending', reqCtrl.getPendingRequests);
router.post('/:id/approve', reqCtrl.approveRequest);

module.exports = router;
