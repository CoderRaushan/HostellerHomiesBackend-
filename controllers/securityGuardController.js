
const Guard = require("../models/SecurityGuard.js");

exports.getAllGuards = async (req, res) => {
  try {
    const { hostelNo } = req.query;
    let filter = {};

    if (hostelNo && hostelNo !== "ALL") {
      filter.hostelNo = hostelNo;
    }

    const guards = await Guard.find(filter).select("-password");
    res.json({ success: true, guards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update
exports.updateGuard = async (req, res) => {
  try {
    const { shift, status } = req.body;
    const guard = await Guard.findByIdAndUpdate(
      req.params.id,
      { shift, status },
      { new: true }
    );

    if (!guard)
      return res.status(404).json({ success: false, message: "Guard not found" });

    res.json({ success: true, guard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGuardById = async (req, res) => {
  const { id } = req.body;
  try {
    const guard = await Guard.findById(id).select("-password");
    if (!guard) {
      return res.status(404).json({ success: false, message: "Guard not found" });
    }

    res.status(200).json({ success: true, guard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};