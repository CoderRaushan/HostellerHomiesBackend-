// models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'student', required: true },
  studentName: { type: String }, // denormalized for convenience
  studentAcNo: { type: String }, // if you store account/room number

  // requested item details
  item: {
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },

  // requested date (day/month/year) — we'll store ISODate and also derived year/month/date for easy queries
  requestedFor: { type: Date, required: true },
  day: { type: Number },   // day of month
  month: { type: Number }, // 1-12
  year: { type: Number },

  // status: pending | approved | rejected
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },

  // butler details on approval
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Butler' },
  approvedAt: { type: Date },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema);
