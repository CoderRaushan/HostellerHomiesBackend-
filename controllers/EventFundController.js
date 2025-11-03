
// const EventFund = require('../models/EventFundmodel.js');

// exports.EventFundRegister = async (req, res) => {
//     let success = false;
//     const {
//         student,
//         name,
//         urn,
//         roomNumber,
//         hostelNumber,
//         eventDetails,
//         fundRequired
//     } = req.body;
//     try {
//         if (!student || !name || !urn || !roomNumber || !hostelNumber || !eventDetails || !fundRequired) {
//             return res.status(400).json({ success, msg: 'All EventFund fields are required!' });
//         }
//         const eventRequest = new EventFund({
//             student,
//             name,
//             urn,
//             roomNumber,
//             hostelNumber,
//             eventDetails,
//             fundRequired
//         });

//         await eventRequest.save();
//         success = true;
//         res.status(201).json({ success, msg: 'EventFund registered successfully' });

//     } catch (err) {
//         console.error("Error in EventFundRegister:", err.message);
//         res.status(500).json({ success: false, msg: 'Server error while registering EventFund' });
//     }
// };





const Student = require('../models/Student'); // apna student model yahan import karo
const EventFund = require('../models/EventFundmodel');


exports.EventFundRegister = async (req, res) => {
    console.log("Event Fund Register API Hit ✅");
    let success = false;

    try {
        const { student, name, urn, roomNumber, hostelNumber, eventDetails, fundRequired } = req.body;

        // 1️⃣ Validate all required fields
        if (!student || !name || !urn || !roomNumber || !hostelNumber || !eventDetails || !fundRequired) {
            return res.status(400).json({ success, msg: "All fields are required!" });
        }

        // 2️⃣ Check if the student already has a pending request
        const existingPending = await EventFund.findOne({
            student,
            status: "pending"
        });

        if (existingPending) {
            return res.status(400).json({
                success,
                message: "⚠️ You already have a pending request. Please wait until it is processed."
            });
        }

        // 3️⃣ Delete records older than 1 month (auto cleanup)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const deleteResult = await EventFund.deleteMany({
            createdAt: { $lt: oneMonthAgo }
        });
        console.log(`🧹 Old records deleted: ${deleteResult.deletedCount}`);

        // 4️⃣ Create new request
        const newEventFund = new EventFund({
            student,
            name,
            urn,
            roomNumber,
            hostelNumber,
            eventDetails,
            fundRequired,
            status: "pending"
        });

        await newEventFund.save();
        success = true;

        return res.status(201).json({
            success,
            msg: "✅ Event Fund request registered successfully."
        });

    } catch (err) {
        console.error("❌ Error in EventFundRegister:", err);
        return res.status(500).json({
            success: false,
            msg: "Server error while registering Event Fund.",
            error: err.message
        });
    }
};





exports.getEventFundBtStudentId = async (req, res) => {
    console.log("hi.... here");

    try {
        const { studentId } = req.body;
        console.log("Student ID:", studentId);

        if (!studentId) {
            return res.status(400).json({ success: false, msg: "Student ID is required!" });
        }

        // Calculate one month ago date
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        console.log("One month ago:", oneMonthAgo);

        // Delete records older than 1 month
        const deleteResult = await EventFund.deleteMany({ createdAt: { $lt: oneMonthAgo } });
        console.log("Deleted old records:", deleteResult.deletedCount);

        // Find records from the last 1 month for that student
        const recentEventFunds = await EventFund.find({
            student: studentId,
            createdAt: { $gte: oneMonthAgo }
        }).sort({ createdAt: -1 }); // Sort by recent first

        if (recentEventFunds.length === 0) {
            return res.status(200).json({ success: true, eventDetails: [] });
        }

        res.status(200).json({
            success: true,
            eventDetails: recentEventFunds
        });

    } catch (err) {
        console.error("Error in getEventFundBtStudentId:", err);
        res.status(500).json({ success: false, msg: "Internal server error" });
    }
};



exports.getEventFund = async (req, res) => {
    try {
        const eventFundData = await EventFund.find().populate('student', ['name', 'room_no', 'urn','batch','dept','email',])
        res.status(200).json({ success: true, eventFundData });
    } catch (err) {
        console.error("Error in getEventFund:", err.message);
        res.status(500).json({ success: false, msg: 'Error fetching EventFund data' });
    }
};
exports.updateEventFundStatus = async (req, res) => {
    try {
        const { eventFundId, status, remark } = req.body;

        if (!eventFundId || !status) {
            return res.status(400).json({ message: "EventFund ID and status are required" });
        }

        if (status === "failed" && (!remark || remark.trim() === "")) {
            return res.status(400).json({ message: "Remark is required when marking as failed" });
        }

        const updatedEventFund = await EventFund.findByIdAndUpdate(
            eventFundId,
            { 
                status,
                remark: status === "failed" ? remark : "not required" 
            },
            { new: true }
        );

        if (!updatedEventFund) {
            return res.status(404).json({ message: "EventFund not found" });
        }

        res.status(200).json({ message: "Status updated successfully", eventFund: updatedEventFund });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

