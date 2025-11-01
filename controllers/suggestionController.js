const { validationResult } = require('express-validator');
const { Suggestion } = require('../models');

// @route   Register api/suggestion
// @desc    Register suggestion
// @access  Public
// Register Suggestion (limit 4/day)
exports.registerSuggestion = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }

    const { student, hostel, title, description } = req.body;

    try {
        // 🔹 Step 1: Delete all suggestions older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        await Suggestion.deleteMany({ date: { $lt: thirtyDaysAgo } });

        // 🔹 Step 2: Enforce daily 4 suggestion limit
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayCount = await Suggestion.countDocuments({
            student,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (todayCount >= 4) {
            return res.status(400).json({
                success,
                msg: "You can only submit up to 4 suggestions per day.",
                count: todayCount
            });
        }

        // 🔹 Step 3: Save new suggestion
        const newSuggestion = new Suggestion({
            student,
            hostel,
            title,
            description
        });
        await newSuggestion.save();

        success = true;

        res.json({
            success,
            msg: 'Suggestion registered successfully',
            count: todayCount + 1
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get today's suggestion count
exports.getTodayCount = async (req, res) => {
    try {
        console.log("counting...");
        const { student } = req.query;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const count = await Suggestion.countDocuments({
            student,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};

// 🔹 Get last 1 month suggestion history
exports.getHistory = async (req, res) => {
    try {
        const { student } = req.query;
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        const suggestions = await Suggestion.find({
            student,
            date: { $gte: oneMonthAgo }
        })
            .sort({ date: -1 }) // latest first
            .populate('hostel', 'name') // optional if you want hostel name
            .lean();

        res.json({ suggestions });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};
// @route   GET api/suggestion
// @desc    Get all suggestions by hostel id
// @access  Public
exports.getbyhostel = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }

    const { hostel } = req.body;
    try {
        // Populate full student details needed for admin view
        const suggestions = await Suggestion.find({ hostel })
            .populate('student', ['name', 'urn', 'room_no', 'dept', 'batch', 'course', 'email']);

        success = true;
        res.json({ success, suggestions });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


// ✅ Get all suggestions from last 1 month (admin view)
exports.getMonthlyHistoryforadmin = async (req, res) => {
  try {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // Fetch only suggestions from last 1 month
    const suggestions = await Suggestion.find({
      date: { $gte: oneMonthAgo },
    }).populate("student");

    // Delete older suggestions automatically
    await Suggestion.deleteMany({ date: { $lt: oneMonthAgo } });

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Error fetching monthly history:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching suggestion history",
    });
  }
};



// @route   GET api/suggestion
// @desc    Get all suggestions by student id
// @access  Public
exports.getbystudent = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }
    const { student } = req.body;
    try {
        const suggestions = await Suggestion.find({ student }).populate('hostel', ['name']);
        success = true;
        res.json({ success, suggestions });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

// @route   Update api/suggestion
// @desc    Update suggestion
// @access  Public
exports.updateSuggestion = async (req, res) => {
    let success = false;
    const { id, status } = req.body;
    try {
        const suggestion = await Suggestion.findByIdAndUpdate(id, { status });
        success = true;
        res.json({ success, msg: 'Suggestion updated successfully' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}