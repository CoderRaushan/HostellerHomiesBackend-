const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComplaintSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'student'
    },
    hostel: {
        type: Schema.Types.ObjectId,
        ref: 'hostel'
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date,
        default: null
    }
});

// TTL index: delete document 7 days after resolvedAt is set
ComplaintSchema.index({ resolvedAt: 1 }, { expireAfterSeconds: 604800 });
module.exports = Complaint = mongoose.model('complaint',ComplaintSchema);