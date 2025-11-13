// models/HostelSettings.js
const mongoose = require("mongoose");

const HostelSettingsSchema = new mongoose.Schema(
  {
    hostelNo: { type: String, required: true, unique: true, index: true },
    rebate: { type: Number, default: 0, min: 0 },
    diet: { type: Number, default: 0, min: 0 },
    isTodayMessOff: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HostelSettings", HostelSettingsSchema);
