const express = require('express');
const router = express.Router();
const { EventFundRegister ,getEventFund,getEventFundBtStudentId,updateEventFundStatus} = require('../controllers/EventFundController.js');
router.post('/EventFund',EventFundRegister);
router.get('/EventFund/get', getEventFund);
router.post("/EventFund/student/get",getEventFundBtStudentId);
router.put("/EventFund/admin/update",updateEventFundStatus);
module.exports = router;