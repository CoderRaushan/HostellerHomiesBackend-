// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const EventFundSchema = new Schema({
//     student: {
//         type: Schema.Types.ObjectId,
//         ref: 'student'
//     },
//     hostel: {
//         type: Schema.Types.ObjectId,
//         ref: 'hostel'
//     },
//     name: {
//         type: String,
//         required: true,
//     },
//     urn: {
//         type: Number,
//         required: true,
//     },
//     roomNumber: {
//         type: Number,
//         required: true
//     },
//     // hostelNumber: {
//     //     type: Number,
//     //     required: true
//     // },
//     eventDetails: {
//         type: String,
//         required: true
//     },
//     fundRequired: {
//         type: Number,
//         required: true
//     },
//     status: {
//         type: String,
//         default: "pending",
//     },
//     remark: {
//         type: String,
//         default: "",
//     }
// }, { timestamps: true });

// const EventFund = mongoose.model('EventFund', EventFundSchema);
// module.exports = EventFund;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventFundSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    urn: {
        type: Number,
        required: true
    },
    roomNumber: {
        type: Number,
        required: true
    },
    hostelNumber: {
        type: Number,
        required: true
    },
    eventDetails: {
        type: String,
        required: true
    },
    fundRequired: {
        type: Number,
        required: true
    },

    // -------- Approval Workflow -------- //
    status: {
        type: String,
        enum: ['pending', 'warden_approved', 'warden_rejected', 'chief_approved', 'chief_rejected'],
        default: 'pending'
    },

    wardenApproval: {
        approvedBy: { type: Schema.Types.ObjectId, ref: 'warden' },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        remark: { type: String, default: '' },
        date: { type: Date }
    },

    chiefApproval: {
        approvedBy: { type: Schema.Types.ObjectId, ref: 'SuperAdmin' },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        remark: { type: String, default: '' },
        date: { type: Date }
    },

    // Optional: track history or logs of actions
    history: [{
        role: String,  // 'student', 'warden', 'chiefwarden'
        action: String, // 'created', 'approved', 'rejected'
        remark: String,
        date: { type: Date, default: Date.now }
    }]

}, { timestamps: true });

const EventFund = mongoose.model('EventFund', EventFundSchema);
module.exports = EventFund;
