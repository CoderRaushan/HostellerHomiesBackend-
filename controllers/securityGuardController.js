// // const SecurityGuard = require("../models/SecurityGuard");
// const SecurityGuard=require("../models/SecurityGuard.js")
// // GET all guards
// const getAllGuards = async (req, res) => {
//   try {
//     const guards = await SecurityGuard.find();
//     res.status(200).json(guards);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching guards', error });
//   }
// };

// // PUT set selected guard on duty
// const setGuardOnDuty = async (req, res) => {
//   const { guardId } = req.body;

//   if (!guardId) {
//     return res.status(400).json({ message: 'Guard ID is required' });
//   }

//   try {
//     // Set all guards off-duty first
//     await SecurityGuard.updateMany({}, { $set: { onDuty: false } });

//     // Set selected guard on duty
//     const updatedGuard = await SecurityGuard.findOneAndUpdate(
//       { guardId },
//       { onDuty: true },
//       { new: true }
//     );

//     if (!updatedGuard) {
//       return res.status(404).json({ message: 'Guard not found' });
//     }

//     res.status(200).json({ message: 'Guard set on duty', guard: updatedGuard });
//   } catch (error) {
//     res.status(500).json({ message: 'Error setting guard on duty', error });
//   }
// };

// module.exports = {
//   getAllGuards,
//   setGuardOnDuty,
// };

// Add a new guard
const Guard = require("../models/SecurityGuard");

// Create
exports.addGuard = async (req, res) => {
  try {
    const { name, guardId, shift, post, contact } = req.body;
    if (!name || !guardId || !shift || !post || !contact) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    const existing = await Guard.findOne({ guardId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Guard ID already exists" });
    }
    const guard = new Guard({ name, guardId, shift, post, contact });
    await guard.save();
    res.json({ success: true, guard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Read all
exports.getAllGuards = async (req, res) => {
  try {
    const guards = await Guard.find();
    res.json({ success: true, guards });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update
exports.updateGuard = async (req, res) => {
  try {
    const { name, shift, post, contact } = req.body;
    const guard = await Guard.findByIdAndUpdate(
      req.params.id,
      { name, shift, post, contact },
      { new: true }
    );
    if (!guard) return res.status(404).json({ success: false, message: "Guard not found" });
    res.json({ success: true, guard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete
exports.deleteGuard = async (req, res) => {
  try {
    const guard = await Guard.findByIdAndDelete(req.params.id);
    if (!guard) return res.status(404).json({ success: false, message: "Guard not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};