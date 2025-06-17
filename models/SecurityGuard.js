// // models/SecurityGuard.js

// const mongoose = require('mongoose');

// const SecurityGuardSchema = new mongoose.Schema({
//   guardId: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   shift: {
//     type: String,
//     enum: ['Day', 'Night', 'Evening'],
//     required: true,
//   },
//   contact: {
//     type: String,
//     required: true,
//   },
//   post: {
//     type: String,
//     required: true,
//   },
//   onDuty: {
//     type: Boolean,
//     default: false,
//   },
// }, { timestamps: true });

// const SecurityGuard = mongoose.model('SecurityGuard', SecurityGuardSchema);

// module.exports = SecurityGuard;
const mongoose = require("mongoose");

const guardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  guardId: { type: String, required: true, unique: true },
  shift: { type: String, enum: ["Day", "Night"], required: true },
  post: { type: String, required: true },
  contact: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
});

module.exports = mongoose.model("Guard", guardSchema);