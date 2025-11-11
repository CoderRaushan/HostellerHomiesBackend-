
const Guard = require("../models/SecurityGuard.js");

// Create
// exports.addGuard = async (req, res) => {
//   try {
//     const { name, guardId, shift, post, contact, status } = req.body;
//     if (!name || !guardId || !shift || !post || !contact || !status) {
//       return res.status(400).json({ success: false, message: "All fields required" });
//     }
//     console.log(req.body)
//     const existing = await Guard.findOne({ guardId });
//     console.log("existing",existing);
//     if (existing) {
//       return res.status(400).json({ success: false, message: "Guard ID already exists" });
//     }
//     console.log("before save")
//     const guard = new Guard({ name, guardId, shift, post, contact, status });
//     await guard.save();
//     console.log("after saved",guard);
//     res.json({ success: true, guard });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// Read all
exports.getAllGuards = async (req, res) => {
  try {
    console.log("Finding....");
    const guards = await Guard.find().select("-password");
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
    if (!guard) return res.status(404).json({ success: false, message: "Guard not found" });
    res.json({ success: true, guard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGuardById=async(req,res)=>
{
   const { id } = req.body;
  try {
    const guard = await Guard.findById(id).select("-password");
    console.log(guard);
    if (!guard) {
      return res.status(404).json({ success: false, message: "Guard not found" });
    }

    res.status(200).json({ success: true, guard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};