// const { validationResult } = require('express-validator');
// const { Suggestion } = require('../models');
// const { Hostel } = require('../models');

// // @route   Register api/suggestion
// // @desc    Register suggestion
// // @access  Public
// // Register Suggestion (limit 4/day)
// exports.registerSuggestion = async (req, res) => {
//     let success = false;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array(), success });
//     }

//     const { student, hostel, title, description } = req.body;

//     try {
//         // 🔹 Step 1: Delete all suggestions older than 30 days
//         const thirtyDaysAgo = new Date();
//         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//         await Suggestion.deleteMany({ date: { $lt: thirtyDaysAgo } });

//         // 🔹 Step 2: Enforce daily 4 suggestion limit
//         const startOfDay = new Date();
//         startOfDay.setHours(0, 0, 0, 0);
//         const endOfDay = new Date();
//         endOfDay.setHours(23, 59, 59, 999);

//         const todayCount = await Suggestion.countDocuments({
//             student,
//             date: { $gte: startOfDay, $lte: endOfDay }
//         });

//         if (todayCount >= 4) {
//             return res.status(400).json({
//                 success,
//                 msg: "You can only submit up to 4 suggestions per day.",
//                 count: todayCount
//             });
//         }

//         // 🔹 Step 3: Save new suggestion
//         const newSuggestion = new Suggestion({
//             student,
//             hostel,
//             title,
//             description
//         });
//         await newSuggestion.save();

//         success = true;

//         res.json({
//             success,
//             msg: 'Suggestion registered successfully',
//             count: todayCount + 1
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// };

// // Get today's suggestion count
// exports.getTodayCount = async (req, res) => {
//     try {
//         const { student } = req.query;
//         const startOfDay = new Date();
//         startOfDay.setHours(0, 0, 0, 0);
//         const endOfDay = new Date();
//         endOfDay.setHours(23, 59, 59, 999);

//         const count = await Suggestion.countDocuments({
//             student,
//             date: { $gte: startOfDay, $lte: endOfDay }
//         });

//         res.json({ count });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Server error");
//     }
// };

// // 🔹 Get last 1 month suggestion history
// exports.getHistory = async (req, res) => {
//     try {
//         const { student } = req.query;
//         const oneMonthAgo = new Date();
//         oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

//         const suggestions = await Suggestion.find({
//             student,
//             date: { $gte: oneMonthAgo }
//         })
//             .sort({ date: -1 }) // latest first
//             .populate('hostel', 'name') // optional if you want hostel name
//             .lean();

//         res.json({ suggestions });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Server error");
//     }
// };
// // @route   GET api/suggestion
// // @desc    Get all suggestions by hostel id
// // @access  Public
// exports.getbyhostel = async (req, res) => {
//     let success = false;

//     const { HostelNo } = req.body;
//     try {
//         const hostel = await Hostel.findOne({ name: HostelNo });
//         const suggestions = await Suggestion.find({ hostel: hostel._id })
//             .populate('student', ['name', 'urn', 'room_no', 'dept', 'batch', 'course', 'email']);

//         success = true;
//         res.json({ success, suggestions });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// };


// // ✅ Get all suggestions from last 1 month (admin view)
// exports.getMonthlyHistoryforadmin = async (req, res) => {
//   try {
//     const today = new Date();
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(today.getMonth() - 1);

//     const suggestions = await Suggestion.find({
//       date: { $gte: oneMonthAgo },
//     }).populate("student");

//     // Delete older suggestions automatically
//     await Suggestion.deleteMany({ date: { $lt: oneMonthAgo } });

//     res.status(200).json({
//       success: true,
//       suggestions,
//     });
//   } catch (error) {
//     console.error("Error fetching monthly history:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching suggestion history",
//     });
//   }
// };



// // @route   GET api/suggestion
// // @desc    Get all suggestions by student id
// // @access  Public
// exports.getbystudent = async (req, res) => {
//     let success = false;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array(), success });
//     }
//     const { student } = req.body;
//     try {
//         const suggestions = await Suggestion.find({ student }).populate('hostel', ['name']);
//         success = true;
//         res.json({ success, suggestions });
//     }
//     catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// }

// // @route   Update api/suggestion
// // @desc    Update suggestion
// // @access  Public
// exports.updateSuggestion = async (req, res) => {
//     let success = false;
//     const { id, status } = req.body;
//     try {
//         const suggestion = await Suggestion.findByIdAndUpdate(id, { status });
//         success = true;
//         res.json({ success, msg: 'Suggestion updated successfully' });
//     }
//     catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// }




// const { validationResult } = require("express-validator");
// const { Suggestion, Hostel } = require("../models");

// // ==========================================================
// // 📌 Register Suggestion (Student)
// // ==========================================================
// exports.registerSuggestion = async (req, res) => {
//   let success = false;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array(), success });
//   }

//   const { student, hostel, title, description, suggestionFor } = req.body;

//   try {
//     // 🔹 Step 1: Delete suggestions older than 30 days
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//     await Suggestion.deleteMany({ date: { $lt: thirtyDaysAgo } });

//     // 🔹 Step 2: Check daily submission limit (max 2 per day)
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     const todayCount = await Suggestion.countDocuments({
//       student,
//       date: { $gte: startOfDay, $lte: endOfDay },
//     });

//     if (todayCount >= 2) {
//       return res.status(400).json({
//         success,
//         msg: "You can only submit up to 2 suggestions per day.",
//         count: todayCount,
//       });
//     }

//     // 🔹 Step 3: Save the new suggestion
//     const newSuggestion = new Suggestion({
//       student,
//       hostel,
//       title,
//       description,
//       suggestionFor, // ✅ (Hostel / Mess)
//     });

//     await newSuggestion.save();

//     success = true;
//     res.json({
//       success,
//       msg: "Suggestion registered successfully",
//       count: todayCount + 1,
//     });
//   } catch (err) {
//     console.error("Error registering suggestion:", err.message);
//     res.status(500).send("Server error");
//   }
// };

// // ==========================================================
// // 📌 Get today's suggestion count (Student)
// // ==========================================================
// exports.getTodayCount = async (req, res) => {
//   try {
//     const { student } = req.query;
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     const count = await Suggestion.countDocuments({
//       student,
//       date: { $gte: startOfDay, $lte: endOfDay },
//     });

//     res.json({ count });
//   } catch (error) {
//     console.error("Error fetching suggestion count:", error);
//     res.status(500).send("Server error");
//   }
// };

// // ==========================================================
// // 📌 Get last 1-month suggestion history (Student)
// // ==========================================================
// exports.getHistory = async (req, res) => {
//   try {
//     const { student } = req.query;
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

//     const suggestions = await Suggestion.find({
//       student,
//       date: { $gte: oneMonthAgo },
//     })
//       .sort({ date: -1 })
//       .populate("hostel", "name")
//       .lean();

//     res.json({ suggestions });
//   } catch (error) {
//     console.error("Error fetching student suggestion history:", error);
//     res.status(500).send("Server error");
//   }
// };

// // ==========================================================
// // 📌 Get all Hostel suggestions (Caretaker)
// // ==========================================================
// exports.getHostelSuggestions = async (req, res) => {
//   try {
//     const { HostelNo } = req.body;

//     // ✅ Input validation
//     if (!HostelNo) {
//       return res
//         .status(400)
//         .json({ success: false, msg: "Hostel number is required" });
//     }

//     const hostel = await Hostel.findOne({ name: HostelNo });
//     if (!hostel) {
//       return res
//         .status(404)
//         .json({ success: false, msg: "Hostel not found" });
//     }

//     // ✅ Fetch only "Hostel" suggestions
//     const suggestions = await Suggestion.find({
//       hostel: hostel._id,
//       suggestionFor: "Hostel",
//     })
//       .populate("student", [
//         "name",
//         "urn",
//         "room_no",
//         "dept",
//         "batch",
//         "course",
//         "email",
//       ])
//       .sort({ date: -1 });

//     res.status(200).json({
//       success: true,
//       count: suggestions.length,
//       suggestions,
//     });
//   } catch (err) {
//     console.error("Error fetching hostel suggestions:", err.message);
//     res.status(500).json({
//       success: false,
//       msg: "Server error while fetching hostel suggestions",
//     });
//   }
// };

// // ==========================================================
// // 📌 Get all Mess suggestions (Manager)
// // ==========================================================
// exports.getMessSuggestions = async (req, res) => {
//   try {
//     const suggestions = await Suggestion.find({
//       suggestionFor: "Mess",
//     })
//       .populate("student", [
//         "name",
//         "urn",
//         "room_no",
//         "dept",
//         "batch",
//         "course",
//         "email",
//       ])
//       .sort({ date: -1 });

//     res.status(200).json({
//       success: true,
//       count: suggestions.length,
//       suggestions,
//     });
//   } catch (err) {
//     console.error("Error fetching mess suggestions:", err.message);
//     res.status(500).json({
//       success: false,
//       msg: "Server error while fetching mess suggestions",
//     });
//   }
// };

// // ==========================================================
// // 📌 Get 1-month history (Admin / Manager dashboard)
// // ==========================================================
// exports.getMonthlyHistoryforadmin = async (req, res) => {
//   try {
//     const today = new Date();
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(today.getMonth() - 1);

//     const suggestions = await Suggestion.find({
//       date: { $gte: oneMonthAgo },
//     }).populate("student");

//     // Delete older than 1 month
//     await Suggestion.deleteMany({ date: { $lt: oneMonthAgo } });

//     res.status(200).json({
//       success: true,
//       suggestions,
//     });
//   } catch (error) {
//     console.error("Error fetching monthly admin history:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching suggestion history",
//     });
//   }
// };

// // ==========================================================
// // 📌 Get all suggestions by student (Admin optional)
// // ==========================================================
// exports.getbystudent = async (req, res) => {
//   let success = false;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array(), success });
//   }

//   const { student } = req.body;
//   try {
//     const suggestions = await Suggestion.find({ student }).populate("hostel", [
//       "name",
//     ]);
//     success = true;
//     res.json({ success, suggestions });
//   } catch (err) {
//     console.error("Error fetching student-specific suggestions:", err.message);
//     res.status(500).send("Server error");
//   }
// };

// // ==========================================================
// // 📌 Update Suggestion Status (Approve / Deny)
// // ==========================================================
// exports.updateSuggestion = async (req, res) => {
//   let success = false;
//   const { id, status } = req.body;
//   try {
//     const suggestion = await Suggestion.findByIdAndUpdate(id, { status });
//     if (!suggestion)
//       return res.status(404).json({ success, msg: "Suggestion not found" });

//     success = true;
//     res.json({ success, msg: "Suggestion updated successfully" });
//   } catch (err) {
//     console.error("Error updating suggestion:", err.message);
//     res.status(500).send("Server error");
//   }
// };


const { validationResult } = require("express-validator");
const { Suggestion, Hostel } = require("../models");

// ==========================================================
// 📌 Register Suggestion (Student)
// ==========================================================
exports.registerSuggestion = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success });
  }

  const { student, hostel, title, description, suggestionFor } = req.body;

  try {
    // 🔹 Step 1: Delete suggestions older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await Suggestion.deleteMany({ date: { $lt: thirtyDaysAgo } });

    // 🔹 Step 2: Define today's time range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 🔹 Step 3: Count suggestions per type (Hostel / Mess)
    const todayTypeCount = await Suggestion.countDocuments({
      student,
      suggestionFor,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // 🔹 Step 4: Allow max 2 per type (Hostel / Mess)
    if (todayTypeCount >= 2) {
      return res.status(400).json({
        success,
        msg: `You can only submit up to 2 ${suggestionFor} suggestions per day.`,
        count: todayTypeCount,
      });
    }

    // 🔹 Step 5: Save new suggestion
    const newSuggestion = new Suggestion({
      student,
      hostel,
      title,
      description,
      suggestionFor, // "Hostel" or "Mess"
    });

    await newSuggestion.save();

    success = true;
    res.json({
      success,
      msg: "Suggestion registered successfully",
      count: todayTypeCount + 1,
    });
  } catch (err) {
    console.error("Error registering suggestion:", err.message);
    res.status(500).send("Server error");
  }
};

// ==========================================================
// 📌 Get today's suggestion count (Student)
// ==========================================================
exports.getTodayCount = async (req, res) => {
  try {
    const { student, suggestionFor } = req.query;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ✅ Count separately if suggestionFor provided
    const filter = suggestionFor
      ? { student, suggestionFor, date: { $gte: startOfDay, $lte: endOfDay } }
      : { student, date: { $gte: startOfDay, $lte: endOfDay } };

    const count = await Suggestion.countDocuments(filter);
    res.json({ success: true, count });
  } catch (error) {
    console.error("Error fetching suggestion count:", error);
    res.status(500).send("Server error");
  }
};

// ==========================================================
// 📌 Get last 1-month suggestion history (Student)
// ==========================================================
exports.getHistory = async (req, res) => {
  try {
    const { student } = req.query;
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const suggestions = await Suggestion.find({
      student,
      date: { $gte: oneMonthAgo },
    })
      .sort({ date: -1 })
      .populate("hostel", "name")
      .lean();

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error("Error fetching student suggestion history:", error);
    res.status(500).send("Server error");
  }
};

// ==========================================================
// 📌 Get all Hostel suggestions (Caretaker)
// ==========================================================
exports.getHostelSuggestions = async (req, res) => {
  try {
    const { HostelNo } = req.body;

    if (!HostelNo) {
      return res
        .status(400)
        .json({ success: false, msg: "Hostel number is required" });
    }

    const hostel = await Hostel.findOne({ name: HostelNo });
    if (!hostel) {
      return res
        .status(404)
        .json({ success: false, msg: "Hostel not found" });
    }

    const suggestions = await Suggestion.find({
      hostel: hostel._id,
      suggestionFor: "Hostel",
    })
      .populate("student", [
        "name",
        "urn",
        "room_no",
        "dept",
        "batch",
        "course",
        "email",
      ])
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (err) {
    console.error("Error fetching hostel suggestions:", err.message);
    res.status(500).json({
      success: false,
      msg: "Server error while fetching hostel suggestions",
    });
  }
};

// ==========================================================
// 📌 Get all Mess suggestions (Manager)
// ==========================================================
exports.getMessSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find({
      suggestionFor: "Mess",
    })
      .populate("student", [
        "name",
        "urn",
        "room_no",
        "dept",
        "batch",
        "course",
        "email",
      ])
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (err) {
    console.error("Error fetching mess suggestions:", err.message);
    res.status(500).json({
      success: false,
      msg: "Server error while fetching mess suggestions",
    });
  }
};

// ==========================================================
// 📌 Get 1-month Hostel Suggestions History (Caretaker)
// ==========================================================
exports.getHostelSuggestionHistory = async (req, res) => {
  try {
    const { HostelNo } = req.body;

    if (!HostelNo) {
      return res.status(400).json({
        success: false,
        msg: "Hostel number is required",
      });
    }

    const hostel = await Hostel.findOne({ name: HostelNo });
    if (!hostel) {
      return res.status(404).json({
        success: false,
        msg: "Hostel not found",
      });
    }

    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const suggestions = await Suggestion.find({
      hostel: hostel._id,
      suggestionFor: "Hostel",
      date: { $gte: oneMonthAgo },
    })
      .populate("student", [
        "name",
        "urn",
        "room_no",
        "dept",
        "batch",
        "course",
      ])
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (err) {
    console.error("Error fetching hostel suggestion history:", err.message);
    res.status(500).json({
      success: false,
      msg: "Server error while fetching hostel suggestion history",
    });
  }
};

// ==========================================================
// 📌 Get 1-month Mess Suggestions History (Manager)
// ==========================================================
exports.getMessSuggestionHistory = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    const suggestions = await Suggestion.find({
      suggestionFor: "Mess",
      date: { $gte: oneMonthAgo },
    })
      .populate("student", [
        "name",
        "urn",
        "room_no",
        "dept",
        "batch",
        "course",
      ])
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (err) {
    console.error("Error fetching mess suggestion history:", err.message);
    res.status(500).json({
      success: false,
      msg: "Server error while fetching mess suggestion history",
    });
  }
};

// ==========================================================
// 📌 Get 1-month history (Admin / Manager dashboard)
// ==========================================================
exports.getMonthlyHistoryforadmin = async (req, res) => {
  try {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const suggestions = await Suggestion.find({
      date: { $gte: oneMonthAgo },
    }).populate("student");

    await Suggestion.deleteMany({ date: { $lt: oneMonthAgo } });

    res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Error fetching monthly admin history:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching suggestion history",
    });
  }
};

// ==========================================================
// 📌 Get all suggestions by student (Admin optional)
// ==========================================================
exports.getbystudent = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success });
  }

  const { student } = req.body;
  try {
    const suggestions = await Suggestion.find({ student }).populate("hostel", [
      "name",
    ]);
    success = true;
    res.json({ success, suggestions });
  } catch (err) {
    console.error("Error fetching student-specific suggestions:", err.message);
    res.status(500).send("Server error");
  }
};

// ==========================================================
// 📌 Update Suggestion Status (Approve / Deny)
// ==========================================================
exports.updateSuggestion = async (req, res) => {
  let success = false;
  const { id, status } = req.body;
  try {
    const suggestion = await Suggestion.findByIdAndUpdate(id, { status });
    if (!suggestion)
      return res.status(404).json({ success, msg: "Suggestion not found" });

    success = true;
    res.json({ success, msg: "Suggestion updated successfully" });
  } catch (err) {
    console.error("Error updating suggestion:", err.message);
    res.status(500).send("Server error");
  }
};
