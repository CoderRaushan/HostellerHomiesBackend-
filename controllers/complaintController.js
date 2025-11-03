const { validationResult } = require("express-validator");
const { Complaint } = require("../models");

// @route   Register api/compalint
// @desc    Register complaint
// @access  Public
exports.registerComplaint = async (req, res) => {
  let success = false;
  const { student, hostel, type, title, description } = req.body;

  try {
    // 🔍 Check recent complaints by same student for same type
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentComplaint = await Complaint.findOne({
      student,
      type,
      date: { $gte: oneDayAgo },  // Complaints in the last 24h
    });

    if (recentComplaint) {
      return res.status(429).json({
        success,
        msg: `You have already raised a "${type}" complaint in the last 24 hours.`,
      });
    }

    // ✅ Create new complaint
    const newComplaint = new Complaint({
      student,
      hostel,
      type,
      title,
      description,
    });

    await newComplaint.save();
    success = true;
    res.json({ success, msg: "Complaint registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};


// @route   GET api/complaint
// @desc    Get all complaints by hostel id
// @access  Public
exports.getbyhostel = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success });
  }
  const { hostel } = req.body;
  try {
    const complaints = await Complaint.find({ hostel })
      .populate("student", ["name", "room_no", "urn"])
      .lean();
    success = true;
    res.json({ success, complaints });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success, errors: [{ msg: "Server error" }] });
  }
};

// @route   GET api/complaint
// @desc    Get all complaints by student id
// @access  Public
exports.getbystudent = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success });
  }
  const { student } = req.body;
  if (!student) {
    return res
      .status(400)
      .json({ errors: [{ msg: "Student id is required" }], success });
  }
  try {
    const complaints = await Complaint.find({ student });
    success = true;
    res.json({ success, complaints });
  } catch (err) {
    console.error(err.errors);
    res.status(500).json({ success: false, msg: "Server error" });  // ✅ Sends valid JSON
  }
};

// @route   GET api/complaint
// @desc    Get complaint by complaint id
// @access  Public
exports.resolve = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success });
  }
  const { id } = req.body;
  try {
    const complaint = await Complaint.findById(id);
    complaint.status = "solved";
    complaint.resolvedAt = new Date();
    await complaint.save();
    success = true;
    res.json({ success });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Server error" });  // ✅ Sends valid JSON

  }
};
