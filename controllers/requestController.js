// controllers/requestController.js
const mongoose = require('mongoose');
const Request = require('../models/Request');
const Bill = require('../models/Bill');
const Student = require('../models/Student');
const HostelSettings = require('../models/HostelSettings');

/**
 * Helper to get y/m/d from a Date (in IST)
 */
function getISTParts(date = new Date()) {
  const utc = date.getTime();
  const ist = new Date(utc + 5.5 * 60 * 60 * 1000);
  return {
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth() + 1,
    day: ist.getUTCDate(),
    iso: ist.toISOString()
  };
}

/**
 * POST /api/requests/create
 * body: { studentId, item: { name, price }, requestedFor (optional ISO date) }
 */

// exports.createRequest = async (req, res) => {
//   try {
//     const { studentId, item, requestedFor,name,accountNumber } = req.body;
//     if (!studentId || !item || !item.name || typeof item.price !== 'number') {
//       return res.status(400).json({ success: false, message: 'studentId and item (name,price) required' });
//     }

//     const reqDate = requestedFor ? new Date(requestedFor) : new Date();
//     const { year, month, day } = getISTParts(reqDate);

//     const r = new Request({
//       studentId,
//       studentName: name,
//       studentAcNo: accountNumber,
//       item: { name: item.name, price: item.price },
//       requestedFor: reqDate,
//       day,
//       month,
//       year,
//       status: 'pending'
//     });

//     await r.save();
//     return res.json({ success: true, request: r });
//   } catch (err) {
//     console.error('createRequest err', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// };
exports.createRequest = async (req, res) => {
  try {
    const { studentId, item, requestedFor, name, accountNumber, hostelNo } = req.body;
    console.log(hostelNo);
    const hostelsetting = await HostelSettings.findOne({ hostelNo }).lean();
    if (!hostelsetting) {
      console.warn(` No HostelSettings found Aborting.`);
      return;
    }
    const isTodayMessClose = Boolean(hostelsetting.isTodayMessOff);
    if(isTodayMessClose)
    {
        return res.status(201).json({
        success: false,
        message: "Whole mess is closed today, You cannot make request!"
      });
    }
    
    console.log(req.body);
    // 1️⃣ Validate input
    if (!studentId || !item || !item.name || typeof item.price !== "number") {
      return res.status(400).json({
        success: false,
        message: "studentId and item (name, price) required"
      });
    }

    const reqDate = requestedFor ? new Date(requestedFor) : new Date();
    const { year, month, day } = getISTParts(reqDate);

    // 2️⃣ Find student's bill for that month/year
    const bill = await Bill.findOne({ studentId, year, month });
    console.log(bill);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill record not found for this month. Please contact butler."
      });
    }

    // 3️⃣ Check if the mess was closed on that day
    const dayData = bill.days.find((d) => d.date === day);

    if (!dayData) {
      return res.status(400).json({
        success: false,
        message: `No record found for ${day}-${month}-${year}. Please contact butler.`
      });
    }

    if (dayData.isMessClose) {
      return res.status(400).json({
        success: false,
        message: `Mess was closed on ${day}-${month}-${year}. You cannot create a request.`
      });
    }

    // 4️⃣ Create request (mess was open)
    const newRequest = new Request({
      studentId,
      studentName: name,
      studentAcNo: accountNumber,
      item: { name: item.name, price: item.price },
      requestedFor: reqDate,
      day,
      month,
      year,
      status: "pending",
    });

    await newRequest.save();

    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      request: newRequest
    });

  } catch (err) {
    console.error("createRequest error", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * GET /api/requests/student/:studentId
 * returns student's requests (history)
 */
exports.getRequestsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ success: false, message: 'Invalid studentId' });

    const requests = await Request.find({ studentId }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, requests });
  } catch (err) {
    console.error('getRequestsByStudent err', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/requests/pending
 * returns pending requests (for butler)
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' }).sort({ createdAt: 1 }).populate('studentId', 'studentName studentAcNo').lean();
    return res.json({ success: true, requests });
  } catch (err) {
    console.error('getPendingRequests err', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * POST /api/requests/:id/approve
 * body: { butlerId }
 * Approves the request and adds the item to the student's bill on that date.
 */
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { butlerId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid request id' });

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });

    // find or create bill for that student, month, year
    const { year, month, day } = request;
    let bill = await Bill.findOne({ studentId: request.studentId, year, month });

    if (!bill) {
      bill = new Bill({
        studentId: request.studentId,
        year,
        month,
        days: [],
        totalDietAmount: 0,
        totalItemsAmount: 0
      });
    }

    // find day entry
    let dayEntry = bill.days.find(d => d.date === day);

    if (!dayEntry) {
      // create day entry — if mess closed by default we'll set isMessClose false to allow adding
      dayEntry = {
        date: day,
        isMessClose: false,
        diet: { name: 'diet', price: 0 }, // diet may be added by cron; set 0 placeholder
        items: []
      };
      bill.days.push(dayEntry);
    }

    // ensure mess is open (if you want to enforce isMessClose === false)
    if (dayEntry.isMessClose === true) {
      // either reject or open it — here we open it automatically before adding
      dayEntry.isMessClose = false;
    }

    // push the requested item
    dayEntry.items.push({ name: request.item.name, price: request.item.price });

    // update totals
    bill.totalItemsAmount = (bill.totalItemsAmount || 0) + Number(request.item.price || 0);

    // save bill first
    await bill.save();

    // update request
    request.status = 'approved';
    request.approvedBy = butlerId ? butlerId : undefined;
    request.approvedAt = new Date();
    await request.save();

    return res.json({ success: true, request });
  } catch (err) {
    console.error('approveRequest err', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
