const { generateToken, verifyToken } = require('../utils/auth');
const { validationResult } = require('express-validator');
const { Student, Hostel, User, Admin, Room } = require('../models');

const bcrypt = require('bcryptjs');
const Parser = require('json2csv').Parser;
const registerStudent = async (req, res) => {
    let success = false;
    const {
        name, urn, room_no, batch, dept, course,
        accountNumber,
        email, father_name, contact, address,
        dob, uidai, hostelNo, password, role
    } = req.body;

    if (!name || !urn || !room_no || !batch || !dept || !course ||
        !accountNumber || !email || !father_name || !contact ||
        !address || !dob || !uidai || !hostelNo || !password || !role) {
        return res.status(400).json({ success, errors: [{ msg: 'Please fill all fields' }] });
    }

    try {
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
        const shostel = await Hostel.findOne({ name: hostelNo });
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


        // Create student linked to user and hostel
        const student = new Student({
            name,
            urn,
            room_no,
            hostelNo,
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
            role,
            password: hashedPassword,
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

        let success = false;
        const { isAdmin } = req.body;
        if (isAdmin) {
            const { token } = req.body;

            const decoded = verifyToken(token);

            const admin = await Admin.findOne({ user: decoded.userId }).select('-password');

            success = true;
            const UpdatedAdmin = {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                father_name: admin.father_name,
                contact: admin.contact,
                address: admin.address,
                dob: admin.dob,
                uidai: admin.uidai,
                user: admin.user,
                hostel: admin.hostel,
                date: admin.date,
                __v: admin.__v,
                isAdmin: true
            }
            res.json({ success, student: UpdatedAdmin, isAdmin: true });
        }
        else {
            const { token } = req.body;

            const decoded = verifyToken(token);

            const student = await Student.findOne({ user: decoded.userId }).select('-password');

            if (!student) {
                return res.status(400).json({ success, errors: 'Student does not exist' });
            }
            success = true;
            // console.log(student);
            const UpdatedStudent = {
                _id: student._id,
                name: student.name,
                urn: student.urn,
                room_no: student.room_no,
                batch: student.batch,
                dept: student.dept,
                course: student.course,
                email: student.email,
                father_name: student.father_name,
                contact: student.contact,
                accountNumber: student.accountNumber,
                address: student.address,
                dob: student.dob,
                uidai: student.uidai,
                user: student.user,
                hostel: student.hostel,
                date: student.date,
                __v: student.__v,
                isAdmin: false
            }
            res.json({ success, student: UpdatedStudent, isAdmin: false });
        }

    } catch (err) {
        res.status(500).json({ success, errors: 'Server error' });
    }
}

const getAllStudents = async (req, res) => {
    let success = false;
    let { name } = req.body;
    try {
        const shostel = await Hostel.findOne({ name });
        if (!shostel) {
            return res.status(400).json({ success, errors: [{ msg: 'Hostel not found' }] });
        }
        const students = await Student.find({ hostel: shostel.id }).select('-password');
        success = true;
        res.json({ success, students });
    }
    catch (err) {
        res.status(500).json({ success, errors: [{ msg: 'Server error' }] });
        console.log(err);
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
        res.json({ success, student });
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
            hostelNo,
        } = req.body;

        const oldRoomNo = student.room_no;
        const newRoomNo = room_no;

        // ⚙️ If room number changed
        if (oldRoomNo !== newRoomNo) {
            // 🔹 1️⃣ Unassign student from old room
            const oldRoom = await Room.findOne({ roomNumber: oldRoomNo });
            if (oldRoom) {

                oldRoom.occupied = false;

                oldRoom.student = null; // 🧨 THIS LINE removes the old ObjectId

                await oldRoom.save(); // 🔥 Save immediately to apply the change

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

        const shostel = await Hostel.findOne({ name: hostelNo });
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
            hostel: shostel._id,
            hostelNo
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

        const stu = await Student.findById(id).select('-password');

        if (!stu) {
            return res.status(400).json({ success, errors: [{ msg: 'Student does not exist' }] });
        }
        // Find the room assigned to this student
        await Room.updateOne(
            { student: stu._id },  // find room by student
            {
                $set: {
                    occupied: false,
                    student: null,
                },
            }
        );

        await Student.deleteOne({ _id: stu._id });

        success = true;
        res.json({ success, msg: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ success, errors: [{ msg: 'Server error' }] });
    }
};

const csvStudent = async (req, res) => {
    let success = false;
    try {
        const { HostelNo } = req.body;

        const shostel = await Hostel.findOne({ name: HostelNo });

        const students = await Student.find({ hostel: shostel._id }).select('-password');

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