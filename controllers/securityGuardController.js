// const SecurityGuard = require("../models/SecurityGuard");
const SecurityGuard=require("../models/SecurityGuard.js")
// GET all guards
const getAllGuards = async (req, res) => {
  try {
    const guards = await SecurityGuard.find();
    res.status(200).json(guards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching guards', error });
  }
};

// PUT set selected guard on duty
const setGuardOnDuty = async (req, res) => {
  const { guardId } = req.body;

  if (!guardId) {
    return res.status(400).json({ message: 'Guard ID is required' });
  }

  try {
    // Set all guards off-duty first
    await SecurityGuard.updateMany({}, { $set: { onDuty: false } });

    // Set selected guard on duty
    const updatedGuard = await SecurityGuard.findOneAndUpdate(
      { guardId },
      { onDuty: true },
      { new: true }
    );

    if (!updatedGuard) {
      return res.status(404).json({ message: 'Guard not found' });
    }

    res.status(200).json({ message: 'Guard set on duty', guard: updatedGuard });
  } catch (error) {
    res.status(500).json({ message: 'Error setting guard on duty', error });
  }
};

module.exports = {
  getAllGuards,
  setGuardOnDuty,
};
