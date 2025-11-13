// // const { validationResult } = require('express-validator');
// // const { MessOff, Student, User, Hostel } = require('../models/');
// // const { verifyToken } = require('../utils/auth');

// // // @route   request api/messoff/request
// // // @desc    Request for mess off
// // // @access  Public
// // exports.requestMessOff = async (req, res) => {
// //   let success = false;
// //   const errors = validationResult(req);
// //   if (!errors.isEmpty()) {
// //     return res.status(400).json({ message: errors.array(), success });
// //   }

// //   const { student, leaving_date, return_date } = req.body;
// //   try {
// //     // Fetch all requests of this student
// //     const isPending = await MessOff.find({ student });

// //     // ✅ 1. Check if any request is still pending
// //     const hasPending = isPending.some(req => req.status === 'pending');
// //     if (hasPending) {
// //       return res.status(400).json({
// //         success,
// //         message: "You already have a pending request. Please wait until it’s approved or rejected."
// //       });
// //     }

// //     // ✅ 2. Validate date logic
// //     const today = new Date();
// //     const leaveDate = new Date(leaving_date);
// //     const returnDate = new Date(return_date);

// //     if (leaveDate > returnDate) {
// //       return res.status(400).json({ success, message: "Leaving date cannot be greater than return date" });
// //     }

// //     if (leaveDate < today.setHours(0, 0, 0, 0)) {
// //       return res.status(400).json({ success, message: "Request cannot be made for past dates" });
// //     }

// //     // ✅ 3. Check duration (no more than 30 days)
// //     const diffInDays = Math.ceil((returnDate - leaveDate) / (1000 * 60 * 60 * 24));
// //     if (diffInDays > 30) {
// //       return res.status(400).json({
// //         success,
// //         message: "Mess off cannot exceed 30 days."
// //       });
// //     }

// //     // ✅ If everything is fine, create new request
// //     const messOff = new MessOff({
// //       student,
// //       leaving_date,
// //       return_date
// //     });

// //     await messOff.save();
// //     success = true;
// //     return res.status(200).json({ success, message: "Mess off request sent successfully" });

// //   } catch (err) {
// //     console.error(err.message);
// //     return res.status(500).json({ success, message: "Server Error" });
// //   }
// // };

// // exports.messHistory = async (req, res) => {
// //   try {
// //     const { student } = req.body;

// //     // Current date
// //     const today = new Date();

// //     // 1 month ago
// //     const oneMonthAgo = new Date();
// //     oneMonthAgo.setMonth(today.getMonth() - 1);

// //     // ✅ Automatically delete requests older than 1 month
// //     await MessOff.deleteMany({
// //       student,
// //       request_date: { $lt: oneMonthAgo },
// //     });

// //     // ✅ Fetch only last month's records
// //     const lastMonthHistory = await MessOff.find({
// //       student,
// //       request_date: { $gte: oneMonthAgo },
// //     }).sort({ request_date: -1 });

// //     return res.status(200).json({
// //       success: true,
// //       message: "Fetched mess off history (last month).",
// //       history: lastMonthHistory,
// //     });
// //   } catch (err) {
// //     console.error(err);
// //     return res.status(500).json({ success: false, message: "Server Error" });
// //   }
// // };


// // exports.AdminMessHistory = async (req, res) => {
// //   try {
// //     const oneMonthAgo = new Date();
// //     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

// //     // Fetch all records within last 1 month
// //     const history = await MessOff.find({
// //       request_date: { $gte: oneMonthAgo }   // records from last 1 month
// //     })
// //       .populate("student", "name room_no roll_no hostel accountNumber") // populate student details
// //       .sort({ request_date: -1 }); // latest first

// //     res.status(200).json({
// //       success: true,
// //       count: history.length,
// //       history,
// //     });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server Error",
// //     });
// //   }
// // };



// // // @route   GET api/messoff/list
// // // @desc    Get all mess off requests
// // // @access  Public
// // exports.listMessOff = async (req, res) => {
// //   let success = false;
// //   const { HostelNo } = req.body;
// //   try {
// //     const hostel = await Hostel.findOne({ name: HostelNo });
// //     const students = await Student.find({ hostel: hostel._id }).select('_id');
// //     const list = await MessOff.find({ student: { $in: students }, status: "pending" }).populate('student', ['name', 'room_no','urn', 'accountNumber']);
// //     const approved = await MessOff.countDocuments({ student: { $in: students }, status: "approved", leaving_date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) } });
// //     const rejected = await MessOff.countDocuments({ student: { $in: students }, status: "rejected", leaving_date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) } });
// //     success = true;
// //     return res.status(200).json({ success, list, approved, rejected });
// //   }
// //   catch (err) {
// //     // console.error(err.message);
// //     return res.status(500).json({ success, errors: [{ msg: "Server Error" }] });
// //   }
// // }



// // // @route   GET api/messoff/update
// // // @desc    Update mess off request
// // // @access  Public
// // exports.updateMessOff = async (req, res) => {
// //   let success = false;
// //   const errors = validationResult(req);
// //   if (!errors.isEmpty()) {
// //     return res.status(400).json({ errors: errors.array(), success });
// //   }
// //   const { id, status } = req.body;
// //   try {
// //     const messOff = await MessOff.findByIdAndUpdate(id, { status });
// //     success = true;
// //     return res.status(200).json({ success, messOff });
// //   }
// //   catch (err) {
// //     console.error(err.message);
// //     return res.status(500).json({ success, errors: [{ msg: "Server Error" }] });
// //   }
// // }

// // exports.countMessOff = async (req, res) => {
// //   try {
// //     const { student } = req.body;

// //     // Count approved mess-off requests
// //     const approvedCount = await MessOff.countDocuments({ student, status: "approved" });

// //     // Get all mess-off requests of that student
// //     const list = await MessOff.find({ student });

// //     return res.status(200).json({
// //       success: true,
// //       approved: approvedCount,
// //       list,
// //     });
// //   } catch (err) {
// //     console.error("countMessOff Error:", err.message);
// //     return res.status(500).json({
// //       success: false,
// //       errors: [{ msg: "Server Error" }],
// //     });
// //   }
// // };

// const { validationResult } = require('express-validator');
// const MessOff = require('../models/MessOff');

// // helper: strip time part
// function stripTime(d) {
//   const x = new Date(d);
//   x.setHours(0,0,0,0);
//   return x;
// }

// // ---------- Student: Request Mess OFF (only leaving_date) ----------
// exports.requestMessOff = async (req, res) => {
//   let success = false;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ message: errors.array(), success });

//   try {
//     const { student, leaving_date } = req.body;
//     if (!student || !leaving_date) return res.status(400).json({ success, message: "student & leaving_date required" });

//     const today = stripTime(new Date());
//     const leave = stripTime(new Date(leaving_date));
//     const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

//     // Only allow leaving_date === tomorrow
//     if (leave.getTime() !== tomorrow.getTime()) {
//       return res.status(400).json({ success, message: "Leaving date must be tomorrow only." });
//     }

//     // Check if student has any active pending or approved (overlapping) requests
//     const active = await MessOff.findOne({
//       student,
//       status: { $in: ['pending', 'approved', 'on_pending'] }
//     });

//     if (active) {
//       return res.status(400).json({ success, message: "You already have a pending/active mess request. Wait until it is resolved." });
//     }

//     // create off request (no return_date)
//     const doc = new MessOff({
//       student,
//       leaving_date: leave,
//       return_date: null,
//       status: 'pending'
//     });

//     await doc.save();
//     success = true;
//     return res.status(200).json({ success, message: "Mess off request sent (pending)." });

//   } catch(err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// // ---------- Student: Request Mess ON (return_date) ----------
// exports.requestMessOn = async (req, res) => {
//   let success = false;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ message: errors.array(), success });

//   try {
//     const { student, return_date } = req.body;
//     if (!student || !return_date) return res.status(400).json({ success, message: "student & return_date required" });

//     const today = stripTime(new Date());
//     const ret = stripTime(new Date(return_date));

//     if (ret < today) {
//       return res.status(400).json({ success, message: "Return date cannot be past." });
//     }

//     // Find latest approved off for this student that has no return_date yet
//     const approvedOff = await MessOff.findOne({ student, status: 'approved', return_date: null }).sort({ leaving_date: -1 });
//     if (!approvedOff) {
//       return res.status(400).json({ success, message: "No active approved mess-off found to request mess-on." });
//     }

//     // return_date must be >= leaving_date
//     const leave = stripTime(approvedOff.leaving_date);
//     if (ret.getTime() < leave.getTime()) {
//       return res.status(400).json({ success, message: "Return date cannot be before leaving date." });
//     }

//     // mark this document as on_pending and set return_date (pending approval)
//     approvedOff.return_date = ret;
//     approvedOff.status = 'on_pending';
//     await approvedOff.save();

//     success = true;
//     return res.status(200).json({ success, message: "Mess on request sent (pending)." });

//   } catch(err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// // ---------- Admin: update request status ----------
// // This update handles both approving off and approving on
// exports.updateMessOff = async (req, res) => {
//   let success = false;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array(), success });

//   const { id, status } = req.body; // status: 'approved' | 'rejected' | 'completed' (completed = approve on)
//   try {
//     const doc = await MessOff.findById(id);
//     if (!doc) return res.status(404).json({ success, message: "Request not found" });

//     // If admin approves initial off
//     if (status === 'approved' && doc.status === 'pending') {
//       doc.status = 'approved';
//       await doc.save();
//       success = true;
//       return res.status(200).json({ success, message: "Mess off approved." });
//     }

//     // If admin rejects initial off
//     if (status === 'rejected' && doc.status === 'pending') {
//       doc.status = 'rejected';
//       await doc.save();
//       success = true;
//       return res.status(200).json({ success, message: "Mess off rejected." });
//     }

//     // If admin approves 'on' request (doc.status === 'on_pending'), set to 'completed'
//     if ((status === 'completed' || status === 'on_approved') && doc.status === 'on_pending') {
//       // doc.return_date already set by student when requesting on
//       doc.status = 'completed';
//       await doc.save();
//       success = true;
//       return res.status(200).json({ success, message: "Mess on approved — off period closed." });
//     }

//     // If admin rejects 'on' request
//     if (status === 'rejected' && doc.status === 'on_pending') {
//       // remove return_date (student can request again)
//       doc.return_date = null;
//       doc.status = 'approved'; // keep the off approved state
//       await doc.save();
//       success = true;
//       return res.status(200).json({ success, message: "Mess on request rejected." });
//     }

//     return res.status(400).json({ success, message: "Invalid status transition." });

//   } catch(err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// // ---------- History: month filter (works as earlier) ----------
// exports.messHistory = async (req, res) => {
//   try {
//     const { student, month } = req.body; // optional YYYY-MM
//     const today = new Date();
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//     // optional: clean older records (keep as you had)
//     await MessOff.deleteMany({ student, request_date: { $lt: oneMonthAgo } });

//     const query = { student };
//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       const start = new Date(y, m-1, 1);
//       const end = new Date(y, m-1 + 1, 1);
//       query.request_date = { $gte: start, $lt: end };
//     } else {
//       query.request_date = { $gte: oneMonthAgo };
//     }

//     const history = await MessOff.find(query).sort({ request_date: -1 });
//     return res.status(200).json({ success: true, history });
//   } catch(err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// // ---------- Status endpoint for frontend (pending/approved etc) ----------
// exports.messStatus = async (req, res) => {
//   try {
//     const { student } = req.body;
//     // find any pending request (either off pending or on_pending)
//     const pending = await MessOff.findOne({ student, status: { $in: ['pending','on_pending'] } }).sort({ request_date: -1 });
//     // find latest approved off that hasn't been completed yet
//     const approvedActive = await MessOff.findOne({ student, status: 'approved' }).sort({ leaving_date: -1 });
//     // counts
//     const approvedCount = await MessOff.countDocuments({ student, status: { $in: ['approved','completed'] } });

//     return res.status(200).json({ success: true, pending, approvedActive, approvedCount });
//   } catch(err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server Error" });
//   }
// };
// exports.listMessOff = async (req, res) => {
//   try {
//     const { HostelNo } = req.body;
//     if (!HostelNo) return res.status(400).json({ success: false, errors: [{ msg: "HostelNo required" }] });

//     // find hostel and students
//     const hostel = await Hostel.findOne({ name: HostelNo });
//     if (!hostel) return res.status(400).json({ success: false, errors: [{ msg: "Hostel not found" }] });

//     const students = await Student.find({ hostel: hostel._id }).select('_id');
//     const studentIds = students.map(s => s._id);

//     // pending list (populate student info)
//     const list = await MessOff.find({ student: { $in: studentIds }, status: "pending" })
//       .populate('student', ['name', 'room_no', 'urn', 'accountNumber'])
//       .sort({ request_date: -1 });

//     // counts for current month
//     const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
//     const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

//     const approved = await MessOff.countDocuments({
//       student: { $in: studentIds },
//       status: "approved",
//       leaving_date: { $gte: startOfMonth, $lte: endOfMonth },
//     });

//     const rejected = await MessOff.countDocuments({
//       student: { $in: studentIds },
//       status: "rejected",
//       leaving_date: { $gte: startOfMonth, $lte: endOfMonth },
//     });

//     return res.status(200).json({ success: true, list, approved, rejected });
//   } catch (err) {
//     console.error("listMessOff error:", err);
//     return res.status(500).json({ success: false, errors: [{ msg: "Server Error" }] });
//   }
// };

// // ------------------ AdminMessHistory (admin full history with month filter) ------------------
// exports.AdminMessHistory = async (req, res) => {
//   try {
//     const { month } = req.body || {};
//     let query = {};

//     if (month) {
//       const [y, m] = month.split('-').map(Number);
//       if (!y || !m) return res.status(400).json({ success: false, message: "Invalid month format. Use YYYY-MM" });
//       const start = new Date(y, m - 1, 1);
//       const end = new Date(y, m - 1 + 1, 1);
//       query.request_date = { $gte: start, $lt: end };
//     } else {
//       const oneMonthAgo = new Date();
//       oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
//       query.request_date = { $gte: oneMonthAgo };
//     }

//     const history = await MessOff.find(query)
//       .populate("student", "name room_no roll_no hostel accountNumber urn")
//       .sort({ request_date: -1 });

//     res.status(200).json({ success: true, count: history.length, history });
//   } catch (err) {
//     console.error("AdminMessHistory error:", err);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// // ------------------ countMessOff (student counts) ------------------
// exports.countMessOff = async (req, res) => {
//   try {
//     const { student } = req.body;
//     if (!student) return res.status(400).json({ success: false, errors: [{ msg: "Student required" }] });

//     const approvedCount = await MessOff.countDocuments({ student, status: "approved" });
//     const list = await MessOff.find({ student }).sort({ request_date: -1 });

//     return res.status(200).json({ success: true, approved: approvedCount, list });
//   } catch (err) {
//     console.error("countMessOff Error:", err);
//     return res.status(500).json({ success: false, errors: [{ msg: "Server Error" }] });
//   }
// };

// controllers/messoffController.js
const { validationResult } = require('express-validator');
const MessOff = require('../models/MessOff');
const Student = require('../models/Student'); // adjust path if needed
const Hostel = require('../models/Hostel'); // adjust path if needed

// helper: strip time part
function stripTime(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// ---------- Student: Request Mess OFF (only leaving_date) ----------
exports.requestMessOff = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array(), success });

  try {
    const { student, leaving_date } = req.body;
    if (!student || !leaving_date) return res.status(400).json({ success, message: "student & leaving_date required" });

    const today = stripTime(new Date());
    const leave = stripTime(new Date(leaving_date));
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    // Only allow leaving_date === tomorrow
    if (leave.getTime() !== tomorrow.getTime()) {
      return res.status(400).json({ success, message: "Leaving date must be tomorrow only." });
    }

    // Check if student has any active pending or approved (overlapping) requests
    const active = await MessOff.findOne({
      student,
      status: { $in: ['pending', 'approved', 'on_pending'] }
    });

    if (active) {
      return res.status(400).json({ success, message: "You already have a pending/active mess request. Wait until it is resolved." });
    }

    // create off request (no return_date)
    const doc = new MessOff({
      student,
      leaving_date: leave,
      return_date: null,
      status: 'pending'
    });

    await doc.save();
    success = true;
    return res.status(200).json({ success, message: "Mess off request sent (pending)." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------- Student: Request Mess ON (return_date) ----------
exports.requestMessOn = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array(), success });

  try {
    const { student, return_date } = req.body;
    if (!student || !return_date) return res.status(400).json({ success, message: "student & return_date required" });

    const today = stripTime(new Date());
    const ret = stripTime(new Date(return_date));

    if (ret < today) {
      return res.status(400).json({ success, message: "Return date cannot be past." });
    }

    // Find latest approved off for this student that has no return_date yet
    const approvedOff = await MessOff.findOne({ student, status: 'approved', return_date: null }).sort({ leaving_date: -1 });
    if (!approvedOff) {
      return res.status(400).json({ success, message: "No active approved mess-off found to request mess-on." });
    }

    // return_date must be >= leaving_date
    const leave = stripTime(approvedOff.leaving_date);
    if (ret.getTime() < leave.getTime()) {
      return res.status(400).json({ success, message: "Return date cannot be before leaving date." });
    }

    // mark this document as on_pending and set return_date (pending approval)
    approvedOff.return_date = ret;
    approvedOff.status = 'on_pending';
    await approvedOff.save();

    success = true;
    return res.status(200).json({ success, message: "Mess on request sent (pending)." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------- Admin: update request status ----------
exports.updateMessOff = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array(), success });

  const { id, status } = req.body; // status: 'approved' | 'rejected' | 'completed'
  try {
    const doc = await MessOff.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Request not found" });

    // Approve initial off
    if (status === 'approved' && doc.status === 'pending') {
      doc.status = 'approved';
      await doc.save();
      return res.status(200).json({ success: true, message: "Mess off approved." });
    }

    // Reject initial off
    if (status === 'rejected' && doc.status === 'pending') {
      doc.status = 'rejected';
      await doc.save();
      return res.status(200).json({ success: true, message: "Mess off rejected." });
    }

    // Approve 'on' request (doc.status === 'on_pending') => complete
    if ((status === 'completed' || status === 'on_approved') && doc.status === 'on_pending') {
      doc.status = 'completed';
      await doc.save();
      return res.status(200).json({ success: true, message: "Mess on approved — off period closed." });
    }

    // Reject 'on' request
    if (status === 'rejected' && doc.status === 'on_pending') {
      doc.return_date = null;
      doc.status = 'approved'; // keep off approved
      await doc.save();
      return res.status(200).json({ success: true, message: "Mess on request rejected." });
    }

    return res.status(400).json({ success: false, message: "Invalid status transition." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ------------------ listMessOff (for butler) ------------------
exports.listMessOff = async (req, res) => {
  try {
    const { HostelNo } = req.body;
    if (!HostelNo) return res.status(400).json({ success: false, errors: [{ msg: "HostelNo required" }] });

    const hostel = await Hostel.findOne({ name: HostelNo });
    if (!hostel) return res.status(400).json({ success: false, errors: [{ msg: "Hostel not found" }] });

    const students = await Student.find({ hostel: hostel._id }).select('_id');
    const studentIds = students.map(s => s._id);

    // include both off requests and on requests
    const list = await MessOff.find({ student: { $in: studentIds }, status: { $in: ["pending", "on_pending"] } })
      .populate('student', ['name', 'room_no', 'urn', 'accountNumber'])
      .sort({ request_date: -1 });

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const approved = await MessOff.countDocuments({
      student: { $in: studentIds },
      status: "approved",
      leaving_date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const rejected = await MessOff.countDocuments({
      student: { $in: studentIds },
      status: "rejected",
      leaving_date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    return res.status(200).json({ success: true, list, approved, rejected });
  } catch (err) {
    console.error("listMessOff error:", err);
    return res.status(500).json({ success: false, errors: [{ msg: "Server Error" }] });
  }
};

// ------------------ AdminMessHistory (admin full history with month filter) ------------------
exports.AdminMessHistory = async (req, res) => {
  try {
    const { month } = req.body || {};
    let query = {};

    if (month) {
      const [y, m] = month.split('-').map(Number);
      if (!y || !m) return res.status(400).json({ success: false, message: "Invalid month format. Use YYYY-MM" });
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m - 1 + 1, 1);
      query.request_date = { $gte: start, $lt: end };
    } else {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      query.request_date = { $gte: oneMonthAgo };
    }

    const history = await MessOff.find(query)
      .populate("student", "name room_no roll_no hostel accountNumber urn")
      .sort({ request_date: -1 });

    res.status(200).json({ success: true, count: history.length, history });
  } catch (err) {
    console.error("AdminMessHistory error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ------------------ countMessOff (student counts) ------------------
exports.countMessOff = async (req, res) => {
  try {
    const { student } = req.body;
    if (!student) return res.status(400).json({ success: false, errors: [{ msg: "Student required" }] });

    const approvedCount = await MessOff.countDocuments({ student, status: "approved" });
    const list = await MessOff.find({ student }).sort({ request_date: -1 });

    return res.status(200).json({ success: true, approved: approvedCount, list });
  } catch (err) {
    console.error("countMessOff Error:", err);
    return res.status(500).json({ success: false, errors: [{ msg: "Server Error" }] });
  }
};

// ---------- History: month filter for student (works as earlier) ----------
exports.messHistory = async (req, res) => {
  try {
    const { student, month } = req.body; // optional YYYY-MM
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // optional: clean older records (if you want)
    // await MessOff.deleteMany({ student, request_date: { $lt: oneMonthAgo } });

    const query = { student };
    if (month) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m - 1 + 1, 1);
      query.request_date = { $gte: start, $lt: end };
    } else {
      query.request_date = { $gte: oneMonthAgo };
    }

    const history = await MessOff.find(query).sort({ request_date: -1 });
    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ---------- Status endpoint for frontend (pending/approved etc) ----------
exports.messStatus = async (req, res) => {
  try {
    const { student } = req.body;
    const pending = await MessOff.findOne({ student, status: { $in: ['pending', 'on_pending'] } }).sort({ request_date: -1 });
    const approvedActive = await MessOff.findOne({ student, status: 'approved' }).sort({ leaving_date: -1 });
    const approvedCount = await MessOff.countDocuments({ student, status: { $in: ['approved', 'completed'] } });

    return res.status(200).json({ success: true, pending, approvedActive, approvedCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
