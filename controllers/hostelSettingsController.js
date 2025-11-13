// controllers/hostelSettingsController.js
const HostelSettings = require("../models/HostelSettings");

/**
 * GET /api/hostel-settings?hostelNo=H1
 * Returns settings for hostel; if not found returns defaults (but does not create)
 */
exports.getSettings = async (req, res) => {
  try {
    const hostelNo = req.query.hostelNo;
    if (!hostelNo) return res.status(400).json({ success: false, message: "hostelNo required" });

    const settings = await HostelSettings.findOne({ hostelNo });
    if (!settings) {
      // return defaults without creating doc
      return res.json({ success: true, settings: { hostelNo, rebate: 0, diet: 0, isTodayMessOff: false } });
    }
    // console.log(settings);
    return res.json({ success: true, settings });
    
  } catch (err) {
    console.error("getSettings:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /api/hostel-settings/:hostelNo
 * Create or update settings for the hostel.
 * Body: { rebate?, diet?, isTodayMessOff? }
 */
exports.upsertSettings = async (req, res) => {
  try {
    const { hostelNo } = req.params;
    if (!hostelNo) return res.status(400).json({ success: false, message: "hostelNo required in params" });

    const updates = {};
    ["rebate", "diet", "isTodayMessOff"].forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) updates[k] = req.body[k];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided" });
    }

    // upsert: create if not exists
    const opts = { new: true, upsert: true, setDefaultsOnInsert: true };
    // attach updatedBy if available (optional)
    if (req.user && req.user._id) updates.updatedBy = req.user._id;

    const settings = await HostelSettings.findOneAndUpdate({ hostelNo }, { $set: updates }, opts);
    return res.json({ success: true, settings });
  } catch (err) {
    console.error("upsertSettings:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
