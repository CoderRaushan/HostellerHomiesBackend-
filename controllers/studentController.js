const { generateToken, verifyToken } = require('../utils/auth');
const { validationResult } = require('express-validator');
const { Student, Hostel, User, Admin, Room } = require('../models');

const bcrypt = require('bcryptjs');
const Parser = require('json2csv').Parser;
const registerStudent = async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    const {
        name, urn, room_no, batch, dept, course,
        accountNumber,
        email, father_name, contact, address, 
        dob, uidai, hostel, password, 
    } = req.body;

    if(!name || !urn || !room_no || !batch || !dept || !course ||
        !accountNumber || !email || !father_name || !contact ||
        !address || !dob || !uidai || !hostel || !password) {
        return res.status(400).json({ success, errors: [{ msg: 'Please fill all fields' }] });
    }

    try {
        // Check if student with same URN exists
        let existingStudent = await Student.findOne({ urn });
        if (existingStudent) {
            return res.status(400).json({ success, errors: [{ msg: 'Student with this URN already exists' }] });
        }

        // uidai
        existingStudent = await Student.findOne({ uidai });
        if (existingStudent) {
            return res.status(400).json({ success, errors: [{ msg: 'Student with this UIDAI already exists' }] });
        }

        // contact
        existingStudent = await Student.findOne({ contact });
        if (existingStudent) {
            return res.status(400).json({ success, errors: [{ msg: 'Student with this contact number already exists' }] });
        }

        // Check if user with same email already exists
        let existingUser = await Student.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success, errors: [{ msg: 'Email already registered' }] });
        }

        // Find hostel
        const shostel = await Hostel.findOne({ name: hostel });
        if (!shostel) {
            return res.status(400).json({ success, errors: [{ msg: 'Hostel not found' }] });
        }

         // 🏘️ Step 3: Check room availability
        const room = await Room.findOne({ roomNumber: room_no });
        if (!room) {
            return res.status(404).json({ success, errors: [{ msg: `Room ${room_no} does not exist` }] });
        }
        if (room.occupied) {
            return res.status(400).json({ success, errors: [{ msg: `Room ${room_no} is already occupied` }] });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            isAdmin: false
        });

        await user.save();

        // Create student linked to user and hostel
        const student = new Student({
            name,
            urn,
            room_no,
            batch,
            dept,
            course,
            email,
            father_name,
            contact,
            address,
            dob,
            uidai,
            accountNumber,
            user: user._id,
            hostel: shostel._id
        });

        await student.save();

        room.occupied = true;
        room.student = student._id;
        await room.save();

        success = true;
        res.status(201).json({ success, student, message: `Student registered and room ${room_no} allotted successfully` });

    } catch (err) {
        console.error("Error in registerStudent:", err);
        if (err.code === 11000) {
            return res.status(400).json({ success, errors: [{ msg: err.message }] });
        }
        res.status(500).json({ success, errors: [{ msg: 'Server error' }] });
    }
};


const getStudent = async (req, res) => {
    try {
        // console.log("comming to get student data");
        let success = false;
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({success, errors: errors.array() });
        // }
        // console.log("req body", req.body);
        const { isAdmin } = req.body;
        // console.log("is admin", isAdmin);
        if (isAdmin) 
        {
            // return res.status(400).json({success, errors:  'Admin cannot access this route' });
        const { token } = req.body;
        // console.log("token is ", token);
        const decoded = verifyToken(token);
        // console.log("decoded data", decoded);
        const admin = await Admin.findOne({ user: decoded.userId }).select('-password');
        // console.log("admin data", admin);
        success = true;
        res.json({ success,student:admin,isAdmin:true });
        }
        else
        {
            const { token } = req.body;
            // console.log("token is ", token);
            const decoded = verifyToken(token);
            // console.log("decoded data", decoded);
            const student = await Student.findOne({ user: decoded.userId }).select('-password');
            // console.log("student data", student);
            if (!student) {
                return res.status(400).json({ success, errors: 'Student does not exist' });
            }
            success = true;
            res.json({ success, student,isAdmin:false });
        }
       
    } catch (err) {
        res.status(500).json({ success, errors: 'Server error' });
    }
}

const getAllStudents = async (req, res) => {

    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    let { hostel } = req.body;

    try {

        const shostel = await Hostel.findById(hostel);

        const students = await Student.find({ hostel: shostel.id }).select('-password');

        success = true;
        res.json({ success, students });
    }
    catch (err) {
        res.status(500).json({ success, errors: [{ msg: 'Server error' }] });
    }
}

const getStudentsById = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    let { id } = req.params;

    try {

        const student = await Student.findById(id).select('-password');

        if (!student) {
            return res.status(404).json({ success, errors: [{ msg: 'Student not found' }] });
        }

        success = true;
        res.json({ success, student  });
    }
    catch (err) {
        res.status(500).json({ success, errors: [{ msg: 'Server error' }] });
    }
}

const updateStudent = async (req, res) => {
  let success = false;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success,
        errors: [{ msg: "Student not found" }],
      });
    }

    const {
      name,
      urn,
      room_no,
      batch,
      dept,
      course,
      email,
      father_name,
      contact,
      address,
      dob,
      uidai,
      hostel,
    } = req.body;

    const oldRoomNo = student.room_no;
    const newRoomNo = room_no;

    // ⚙️ If room number changed
    if (oldRoomNo !== newRoomNo) {
      // 🔹 1️⃣ Unassign student from old room
      const oldRoom = await Room.findOne({ roomNumber: oldRoomNo });
      if (oldRoom) {
        console.log(`✅ Cleared old room ${oldRoomNo}`);
        oldRoom.occupied = false;
        console.log(`✅ Cleared old room ${oldRoomNo}`);
        oldRoom.student = null; // 🧨 THIS LINE removes the old ObjectId
        console.log(`✅ Cleared old room ${oldRoomNo}`);
        await oldRoom.save(); // 🔥 Save immediately to apply the change
        console.log(`✅ Cleared old room ${oldRoomNo}`);
      }

      // 🔹 2️⃣ Assign student to new room
      const newRoom = await Room.findOne({ roomNumber: newRoomNo });
      if (!newRoom) {
        return res.status(400).json({
          success,
          errors: [{ msg: `Room ${newRoomNo} not found` }],
        });
      }

      if (newRoom.occupied && String(newRoom.student) !== String(student._id)) {
        return res.status(400).json({
          success,
          errors: [{ msg: `Room ${newRoomNo} already occupied` }],
        });
      }

      newRoom.occupied = true;
      newRoom.student = student._id;
      await newRoom.save();

      student.room_no = newRoomNo;
    }

    const shostel = await Hostel.findOne({ name: hostel });
        if (!shostel) {
            return res.status(400).json({ success, errors: [{ msg: 'Hostel not found' }] });
        }
    // 🔹 3️⃣ Update other fields
    Object.assign(student, {
      name,
      urn,
      batch,
      dept,
      course,
      email,
      father_name,
      contact,
      address,
      dob,
      uidai,
      hostel:shostel._id,
    });

    await student.save();

    success = true;
    res.json({ success, student });
  } catch (err) {
    console.error("❌ Error while saving:", err);
    res.status(500).json({
      success,
      errors: [{ msg: "Server error", error: err.message }],
    });
  }
};


const deleteStudent = async (req, res) => {
    try {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        const { id } = req.body;

        const student = await Student.findById(id).select('-password');

        if (!student) {
            return res.status(400).json({ success, errors: [{ msg: 'Student does not exist' }] });
        }

        const user = await User.findByIdAndDelete(student.user);

        await Student.deleteOne(student);

        success = true;
        res.json({ success, msg: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ success, errors: [{ msg: 'Server error' }] });
    }
}

const csvStudent = async (req, res) => {
    let success = false;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        const { hostel } = req.body;

        const shostel = await Hostel.findById(hostel);

        const students = await Student.find({ hostel: shostel.id }).select('-password');

        students.forEach(student => {
            student.hostel_name = shostel.name;
            student.d_o_b = new Date(student.dob).toDateString().slice(4);
            student.contact_no = "+91 " + student.contact.slice(1);
        });

        const fields = ['name', 'urn', 'room_no', 'batch', 'dept', 'course', 'email', 'father_name', 'contact_no', 'address', 'd_o_b', 'uidai_no', 'hostel_name'];

        const opts = { fields };

        const parser = new Parser(opts);

        const csv = parser.parse(students);

        success = true;
        res.json({ success, csv });
    } catch (err) {
        res.status(500).json({ success, errors: [{ msg: 'Server error' }] });
    }
}

module.exports = {
    registerStudent,
    getStudent,
    updateStudent,
    deleteStudent,
    getAllStudents,
    csvStudent,
    getStudentsById
}