const { generateToken, verifyToken } = require('../utils/auth');
const { validationResult } = require('express-validator');
const { Student, Hostel, User, Admin } = require('../models');
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
        email, fatherName, contact, address, 
        dob, uidai, hostel, password, 
    } = req.body;

    if(!name || !urn || !room_no || !batch || !dept || !course ||
        !accountNumber || !email || !fatherName || !contact ||
        !address || !dob || !uidai || !hostel || !password) {
        return res.status(400).json({ success, errors: [{ msg: 'Please fill all fields' }] });
    }

    try {
        // Check if student with same URN exists
        let existingStudent = await Student.findOne({ urn });
        if (existingStudent) {
            return res.status(400).json({ success, errors: [{ msg: 'Student with this URN already exists' }] });
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
            fatherName,
            contact,
            address,
            dob,
            uidai,
            accountNumber,
            user: user._id,
            hostel: shostel._id
        });

        await student.save();

        success = true;
        res.status(201).json({ success, student });

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
    // console.log(req.body);
    let success = false;
    try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
        return res.status(404).json({ success, errors: [{ msg: 'Student not found' }] });
    }

    const {
        name, urn, room_no, batch, dept, course, email,
        father_name, contact, address, dob, uidai, hostel
    } = req.body;

    student.name = name;
    student.urn = urn;
    student.room_no = room_no;
    student.batch = batch;
    student.dept = dept;
    student.course = course;
    student.email = email;
    student.father_name = father_name;
    student.contact = contact;
    student.address = address;
    student.dob = dob;
    student.uidai = uidai;
    const savedStudent = await student.save();
    success = true;
    res.json({ success, student: savedStudent });

} catch (err) {
    console.error("Error while saving:", err); // <== Ye bhi log karo
    res.status(500).json({ success, errors: [{ msg: 'Server error', error: err.message }] });
}
}

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