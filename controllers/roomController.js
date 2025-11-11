const Room = require("../models/Room");
const Student = require("../models/Student");

// ✅ Initialize 200 rooms only once
const initRooms = async (req, res) => {
  try {
    const count = await Room.countDocuments();
    if (count > 0) return res.json({ message: "Rooms already initialized" });

    const rooms = [];
    for (let i = 1; i <= 200; i++) {
      rooms.push({ roomNumber: i });
    }
    await Room.insertMany(rooms);
    res.json({ message: "200 rooms initialized successfully" });
  } catch (err) {
    // res.status(500).json({ error: err.message });
  }
};

initRooms();




const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('student'); // ✅ populate student data
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching rooms' });
  }
};



// ✅ Get only empty rooms
const getEmptyRooms = async (req, res) => {
  try {
    const emptyRooms = await Room.find({ occupied: false });
    res.json({ success: true, rooms: emptyRooms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get occupied rooms with student details
const getOccupiedRooms = async (req, res) => {
  try {
    const occupied = await Room.find({ occupied: true }).populate(
      "student",
      "name urn room_no"
    );
    res.json({ success: true, rooms: occupied });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Manually allot room to a student (optional endpoint)
const allotRoom = async (req, res) => {
  try {
    const { room_no, studentId } = req.body;

    const room = await Room.findOne({ room_no });
    if (!room)
      return res.status(404).json({ success: false, msg: "Room not found" });
    if (room.occupied)
      return res
        .status(400)
        .json({ success: false, msg: "Room already occupied" });

    const student = await Student.findById(studentId);
    if (!student)
      return res.status(404).json({ success: false, msg: "Student not found" });

    room.occupied = true;
    room.student = studentId;
    await room.save();

    student.room_no = room_no;
    await student.save();

    res.json({
      success: true,
      msg: `Room ${room_no} allotted to ${student.name}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  initRooms,
  getAllRooms,
  getEmptyRooms,
  getOccupiedRooms,
  allotRoom,
};
