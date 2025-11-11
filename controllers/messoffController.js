const { validationResult } = require('express-validator');
const { MessOff, Student, User, Hostel } = require('../models/');
const { verifyToken } = require('../utils/auth');

// @route   request api/messoff/request
// @desc    Request for mess off
// @access  Public
exports.requestMessOff = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array(), success });
  }

  const { student, leaving_date, return_date } = req.body;
  try {
    // Fetch all requests of this student
    const isPending = await MessOff.find({ student });

    // ✅ 1. Check if any request is still pending
    const hasPending = isPending.some(req => req.status === 'pending');
    if (hasPending) {
      return res.status(400).json({
        success,
        message: "You already have a pending request. Please wait until it’s approved or rejected."
      });
    }

    // ✅ 2. Validate date logic
    const today = new Date();
    const leaveDate = new Date(leaving_date);
    const returnDate = new Date(return_date);

    if (leaveDate > returnDate) {
      return res.status(400).json({ success, message: "Leaving date cannot be greater than return date" });
    }

    if (leaveDate < today.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success, message: "Request cannot be made for past dates" });
    }

    // ✅ 3. Check duration (no more than 30 days)
    const diffInDays = Math.ceil((returnDate - leaveDate) / (1000 * 60 * 60 * 24));
    if (diffInDays > 30) {
      return res.status(400).json({
        success,
        message: "Mess off cannot exceed 30 days."
      });
    }

    // ✅ If everything is fine, create new request
    const messOff = new MessOff({
      student,
      leaving_date,
      return_date
    });

    await messOff.save();
    success = true;
    return res.status(200).json({ success, message: "Mess off request sent successfully" });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success, message: "Server Error" });
  }
};

exports.messHistory = async (req, res) => {
  try {
    const { student } = req.body;

    // Current date
    const today = new Date();

    // 1 month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // ✅ Automatically delete requests older than 1 month
    await MessOff.deleteMany({
      student,
      request_date: { $lt: oneMonthAgo },
    });

    // ✅ Fetch only last month's records
    const lastMonthHistory = await MessOff.find({
      student,
      request_date: { $gte: oneMonthAgo },
    }).sort({ request_date: -1 });

    return res.status(200).json({
      success: true,
      message: "Fetched mess off history (last month).",
      history: lastMonthHistory,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.AdminMessHistory = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Fetch all records within last 1 month
    const history = await MessOff.find({
      request_date: { $gte: oneMonthAgo }   // records from last 1 month
    })
      .populate("student", "name room_no roll_no hostel accountNumber") // populate student details
      .sort({ request_date: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



// @route   GET api/messoff/list
// @desc    Get all mess off requests
// @access  Public
exports.listMessOff = async (req, res) => {
  let success = false;
  const { HostelNo } = req.body;
  try {
    const hostel = await Hostel.findOne({ name: HostelNo });
    const students = await Student.find({ hostel: hostel._id }).select('_id');
    const list = await MessOff.find({ student: { $in: students }, status: "pending" }).populate('student', ['name', 'room_no']);
    const approved = await MessOff.countDocuments({ student: { $in: students }, status: "approved", leaving_date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) } });
    const rejected = await MessOff.countDocuments({ student: { $in: students }, status: "rejected", leaving_date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) } });
    success = true;
    return res.status(200).json({ success, list, approved, rejected });
  }
  catch (err) {
    // console.error(err.message);
    return res.status(500).json({ success, errors: [{ msg: "Server Error" }] });
  }
}



// @route   GET api/messoff/update
// @desc    Update mess off request
// @access  Public
exports.updateMessOff = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success });
  }
  const { id, status } = req.body;
  try {
    const messOff = await MessOff.findByIdAndUpdate(id, { status });
    success = true;
    return res.status(200).json({ success, messOff });
  }
  catch (err) {
    console.error(err.message);
    return res.status(500).json({ success, errors: [{ msg: "Server Error" }] });
  }
}

exports.countMessOff = async (req, res) => {
  try {
    const { student } = req.body;

    // Count approved mess-off requests
    const approvedCount = await MessOff.countDocuments({ student, status: "approved" });

    // Get all mess-off requests of that student
    const list = await MessOff.find({ student });

    return res.status(200).json({
      success: true,
      approved: approvedCount,
      list,
    });
  } catch (err) {
    console.error("countMessOff Error:", err.message);
    return res.status(500).json({
      success: false,
      errors: [{ msg: "Server Error" }],
    });
  }
};
