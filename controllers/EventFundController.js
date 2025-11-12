
// // const EventFund = require('../models/EventFundmodel.js');

// // exports.EventFundRegister = async (req, res) => {
// //     let success = false;
// //     const {
// //         student,
// //         name,
// //         urn,
// //         roomNumber,
// //         hostelNumber,
// //         eventDetails,
// //         fundRequired
// //     } = req.body;
// //     try {
// //         if (!student || !name || !urn || !roomNumber || !hostelNumber || !eventDetails || !fundRequired) {
// //             return res.status(400).json({ success, msg: 'All EventFund fields are required!' });
// //         }
// //         const eventRequest = new EventFund({
// //             student,
// //             name,
// //             urn,
// //             roomNumber,
// //             hostelNumber,
// //             eventDetails,
// //             fundRequired
// //         });

// //         await eventRequest.save();
// //         success = true;
// //         res.status(201).json({ success, msg: 'EventFund registered successfully' });

// //     } catch (err) {
// //         console.error("Error in EventFundRegister:", err.message);
// //         res.status(500).json({ success: false, msg: 'Server error while registering EventFund' });
// //     }
// // };





// const Student = require('../models/Student'); // apna student model yahan import karo
// const EventFund = require('../models/EventFundmodel');


// exports.EventFundRegister = async (req, res) => {
//     let success = false;

//     try {
//         const { student, name, urn, roomNumber, hostelNumber, eventDetails, fundRequired } = req.body;

//         // 1️⃣ Validate all required fields
//         if (!student || !name || !urn || !roomNumber || !hostelNumber || !eventDetails || !fundRequired) {
//             return res.status(400).json({ success, msg: "All fields are required!" });
//         }

//         // 2️⃣ Check if the student already has a pending request
//         const existingPending = await EventFund.findOne({
//             student,
//             status: "pending"
//         });

//         if (existingPending) {
//             return res.status(400).json({
//                 success,
//                 message: "⚠️ You already have a pending request. Please wait until it is processed."
//             });
//         }

//         // 3️⃣ Delete records older than 1 month (auto cleanup)
//         const oneMonthAgo = new Date();
//         oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//         const deleteResult = await EventFund.deleteMany({
//             createdAt: { $lt: oneMonthAgo }
//         });

//         // 4️⃣ Create new request
//         const newEventFund = new EventFund({
//             student,
//             name,
//             urn,
//             roomNumber,
//             hostelNumber,
//             eventDetails,
//             fundRequired,
//             status: "pending"
//         });

//         await newEventFund.save();
//         success = true;

//         return res.status(201).json({
//             success,
//             msg: "✅ Event Fund request registered successfully."
//         });

//     } catch (err) {
//         console.error("❌ Error in EventFundRegister:", err);
//         return res.status(500).json({
//             success: false,
//             msg: "Server error while registering Event Fund.",
//             error: err.message
//         });
//     }
// };





// exports.getEventFundBtStudentId = async (req, res) => {

//     try {
//         const { studentId } = req.body;

//         if (!studentId) {
//             return res.status(400).json({ success: false, msg: "Student ID is required!" });
//         }

//         // Calculate one month ago date
//         const oneMonthAgo = new Date();
//         oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//         // Delete records older than 1 month
//         const deleteResult = await EventFund.deleteMany({ createdAt: { $lt: oneMonthAgo } });


//         // Find records from the last 1 month for that student
//         const recentEventFunds = await EventFund.find({
//             student: studentId,
//             createdAt: { $gte: oneMonthAgo }
//         }).sort({ createdAt: -1 }); // Sort by recent first

//         if (recentEventFunds.length === 0) {
//             return res.status(200).json({ success: true, eventDetails: [] });
//         }

//         res.status(200).json({
//             success: true,
//             eventDetails: recentEventFunds
//         });

//     } catch (err) {
//         console.error("Error in getEventFundBtStudentId:", err);
//         res.status(500).json({ success: false, msg: "Internal server error" });
//     }
// };



// exports.getEventFund = async (req, res) => {
//     try {
//         const eventFundData = await EventFund.find().populate('student', ['name', 'room_no', 'urn','batch','dept','email',])
//         res.status(200).json({ success: true, eventFundData });
//     } catch (err) {
//         console.error("Error in getEventFund:", err.message);
//         res.status(500).json({ success: false, msg: 'Error fetching EventFund data' });
//     }
// };
// exports.updateEventFundStatus = async (req, res) => {
//     try {
//         const { eventFundId, status, remark } = req.body;

//         if (!eventFundId || !status) {
//             return res.status(400).json({ message: "EventFund ID and status are required" });
//         }

//         if (status === "failed" && (!remark || remark.trim() === "")) {
//             return res.status(400).json({ message: "Remark is required when marking as failed" });
//         }

//         const updatedEventFund = await EventFund.findByIdAndUpdate(
//             eventFundId,
//             { 
//                 status,
//                 remark: status === "failed" ? remark : "not required" 
//             },
//             { new: true }
//         );

//         if (!updatedEventFund) {
//             return res.status(404).json({ message: "EventFund not found" });
//         }

//         res.status(200).json({ message: "Status updated successfully", eventFund: updatedEventFund });

//     } catch (error) {
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };

const EventFund = require('../models/EventFundmodel.js');

// 🧩 Student creates event fund request
exports.EventFundRegister = async (req, res) => {
  try {
    const { student, name, urn, roomNumber, hostelNumber, eventDetails, fundRequired } = req.body;

    if (!student || !name || !urn || !roomNumber || !hostelNumber || !eventDetails || !fundRequired)
      return res.status(400).json({ success: false, msg: "All fields are required!" });

    const existing = await EventFund.findOne({ student, status: { $in: ["pending", "warden_approved"] } });
    if (existing)
      return res.status(400).json({ success: false, msg: "You already have a pending request!" });

    const event = new EventFund({
      student,
      name,
      urn,
      roomNumber,
      hostelNumber,
      eventDetails,
      fundRequired,
      status: "pending",
      history: [{ role: "student", action: "created", remark: "Request submitted" }],
    });

    await event.save();
    res.status(201).json({ success: true, msg: "Request submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};

// 🧩 Get all event fund requests (for warden or chief)
// 🧩 Get all event fund requests (for warden or chief)
exports.getEventFund = async (req, res) => {
  try {
    const { hostelNumber } = req.query; // 🧩 Get hostel number from query param
    // Calculate 1 month ago date
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // 🧹 Delete requests older than 1 month
    await EventFund.deleteMany({
      updatedAt: { $lt: oneMonthAgo },
    });

    // Create filter object
    const filter = {
      updatedAt: { $gte: oneMonthAgo },
    };

    // If hostel filter provided
    if (hostelNumber) {
      filter.hostelNumber = Number(hostelNumber);
    }

    // Fetch filtered requests
    const data = await EventFund.find(filter).populate("student", [
      "name",
      "urn",
      "room_no",
      "dept",
      "email",
    ]);
    res.json({ success: true, eventFundData: data });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, msg: "Error fetching event fund data" });
  }
};


// 🧩 Get all events of a student
exports.getEventFundBtStudentId = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ success: false, msg: "Student ID required!" });

    const data = await EventFund.find({ student: studentId }).sort({ createdAt: -1 });
    res.json({ success: true, eventDetails: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Internal error" });
  }
};

// 🧩 Warden Approval
exports.wardenAction = async (req, res) => {
  try {
    const { eventFundId, status, remark } = req.body;
    console.log(req.body);

    const fund = await EventFund.findById(eventFundId);
    console.log(fund);
    if (!fund) return res.status(404).json({ success: false, msg: "Request not found!" });

    if (status === "approved") {
      fund.wardenApproval = {
        approvedBy: req.user.id,
        status: "approved",
        remark: remark || "",
        date: new Date(),
      };
      fund.status = "warden_approved";
      fund.history.push({ role: "warden", action: "approved", remark });
    }
    else if (status === "rejected") {
      if (!remark) return res.status(400).json({ success: false, msg: "Remark required for rejection!" });
      fund.wardenApproval = {
        approvedBy: req.user.id,
        status: "rejected",
        remark,
        date: new Date(),
      };
      fund.status = "warden_rejected";
      fund.history.push({ role: "warden", action: "rejected", remark });
    } else {
      return res.status(400).json({ success: false, msg: "Invalid status!" });
    }

    await fund.save();
    res.json({ success: true, msg: "Warden action recorded!", data: fund });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// 🧩 Chief Warden Approval
exports.chiefAction = async (req, res) => {
  try {
    const { eventFundId, status, remark } = req.body;

    const fund = await EventFund.findById(eventFundId);
    if (!fund) return res.status(404).json({ success: false, msg: "Request not found!" });

    if (fund.status !== "warden_approved")
      return res.status(400).json({ success: false, msg: "Request not approved by warden yet!" });

    if (status === "approved") {
      fund.chiefApproval = {
        approvedBy: req.user.id,
        status: "approved",
        remark: remark || "",
        date: new Date(),
      };
      fund.status = "chief_approved";
      fund.history.push({ role: "chiefwarden", action: "approved", remark });
    } else if (status === "rejected") {
      if (!remark) return res.status(400).json({ success: false, msg: "Remark required for rejection!" });
      fund.chiefApproval = {
        approvedBy: req.user.id,
        status: "rejected",
        remark,
        date: new Date(),
      };
      fund.status = "chief_rejected";
      fund.history.push({ role: "chiefwarden", action: "rejected", remark });
    }

    await fund.save();
    res.json({ success: true, msg: "Chief Warden action recorded!", data: fund });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
