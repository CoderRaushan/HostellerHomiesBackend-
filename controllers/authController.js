const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { generateToken, verifyToken } = require('../utils/auth');
const User = require('../models/User');
const SuperAdmin = require("../models/SuperAdmin.js");
const Manager = require("../models/Manager.js");
const Caretaker = require("../models/Caretaker.js");
const Guard = require("../models/SecurityGuard.js");
const Warden = require("../models/Warden.js");
const PrivilegedStudent = require("../models/PrivilegedStudent.js");
const Student = require('../models/Student.js');

exports.login = async (req, res) => {
  let success = false;
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        success,
        errors: [{ msg: "Please provide email, password and role" }],
      });
    }
    // Example: Handle SuperAdmin login
    if (role === "SuperAdmin") {
      const superAdmin = await SuperAdmin.findOne({ email });
      if (!superAdmin) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid SuperAdmin Email" }],
        });
      }

      if (superAdmin.password !== password) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid SuperAdmin Password" }],
        });
      }

      const token = generateToken(superAdmin._id, superAdmin.email, superAdmin.role);
      req.userId = superAdmin._id;

      return res.status(200).json({
        success: true,
        data: {
          token,
          Detail: {
            id: superAdmin._id,
            email: superAdmin.email,
            name: superAdmin.name,
            role: superAdmin.role,
            profilePhoto: superAdmin.profilePhoto,
            address: superAdmin.address,
            phoneNo: superAdmin.phoneNo,
          },
        },
      });
    }
    else if (role === "Manager") {
      const manager = await Manager.findOne({ email });
      if (!manager) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Manager Email" }],
        });
      }

      if (manager.password !== password) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Manager Password" }],
        });
      }

      const token = generateToken(manager._id, manager.email, manager.role);
      req.userId = manager._id;

      return res.status(200).json({
        success: true,
        data: {
          token,
          Detail: {
            id: manager._id,
            email: manager.email,
            name: manager.name,
            role: manager.role,
            profilePhoto: manager.profilePhoto,
            address: manager.address,
            phoneNo: manager.phone,
            hostelNo:manager.hostelNo,
          },
        },
      });
    }
    else if (role === "Caretaker") {
      const caretaker = await Caretaker.findOne({ email });
      if (!caretaker) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Caretaker Email" }],
        });
      }

      if (caretaker.password !== password) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Caretaker Password" }],
        });
      }

      const token = generateToken(caretaker._id, caretaker.email, caretaker.role);
      req.userId = caretaker._id;

      return res.status(200).json({
        success: true,
        data: {
          token,
          Detail: {
            id: caretaker._id,
            email: caretaker.email,
            name: caretaker.name,
            role: caretaker.role,
            profilePhoto: caretaker.profilePhoto,
            address: caretaker.address,
            phoneNo: caretaker.phone,
            hostelNo: caretaker.hostelNo,
          },
        },
      });
    }
    else if (role === "Guard") {
      const guard = await Guard.findOne({ email });
      if (!guard) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Guard Email" }],
        });
      }
      if(guard.status==="Inactive")
      {
        return res.status(400).json({
          success,
          errors: [{ msg: "You are not active by Caretaker" }],
        });
      }

      if (guard.password !== password) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Guard Password" }],
        });
      }

      const token = generateToken(guard._id, guard.email, guard.role);
      req.userId = guard._id;

      return res.status(200).json({
        success: true,
        data: {
          token,
          Detail: {
            id: guard._id,
            email: guard.email,
            name: guard.name,
            role: guard.role,
            profilePhoto: guard.profilePhoto,
            address: guard.address,
            phoneNo: guard.phone,
            hostelNo: guard.hostelNo,
          },
        },
      });
    }
    else if (role === "Warden") {
      const warden = await Warden.findOne({ email });
      if (!warden) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Warden Email" }],
        });
      }

      if (warden.password !== password) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Warden Password" }],
        });
      }

      const token = generateToken(warden._id, warden.email, warden.role);
      req.userId = warden._id;

      return res.status(200).json({
        success: true,
        data: {
          token,
          Detail: {
            id: warden._id,
            email: warden.email,
            name: warden.name,
            role: warden.role,
            profilePhoto: warden.profilePhoto,
            address: warden.address,
            phoneNo: warden.phone,
            hostelNo: warden.hostelNo,
          },
        },
      });
    }
    else if (role === "PrivilegedStudent") {
      const privilegedStudent = await PrivilegedStudent.findOne({ email });
      if (!privilegedStudent) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid PrivilegedStudent Email" }],
        });
      }

      if (privilegedStudent.password !== password) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid PrivilegedStudent Password" }],
        });
      }

      const token = generateToken(privilegedStudent._id, privilegedStudent.email, privilegedStudent.role);
      req.userId = privilegedStudent._id;

      return res.status(200).json({
        success: true,
        data: {
          token,
          Detail: {
            id: privilegedStudent._id,
            email: privilegedStudent.email,
            name: privilegedStudent.name,
            role: privilegedStudent.role,
            profilePhoto: privilegedStudent.profilePhoto,
            address: privilegedStudent.address,
            phoneNo: privilegedStudent.phone,
            hostelNo: privilegedStudent.hostelNo,
          },
        },
      });
    }
    else if (role === "Student") {
      const student = await Student.findOne({ email });
      if (!student) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Student Email" }],
        });
      }
      const oldPassword = await bcrypt.compare(password, student.password);
      if (!oldPassword) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Invalid Student Password" }],
        });
      }

      const token = generateToken(student._id, student.email, student.role);
      req.userId = student._id;

      return res.status(200).json({
        success: true,
        data: {
          token,
          Detail: {
            id: student._id,
            email: student.email,
            name: student.name,
            role: student.role,
            address: student.address,
            phoneNo: student.contact,
            urn: student.urn,
            room_no: student.room_no,
            hostel: student.hostel,
            course: student.course,
            dept: student.dept,
            batch: student.batch,
            uidai: student.uidai,
            father_name: student.father_name,
            dob: student.dob,
            hostelNo: student.hostelNo,
          },
        },
      });
    }
    // If role not handled
    return res.status(400).json({
      success,
      errors: [{ msg: "Invalid role specified" }],
    });

  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({
      success: false,
      errors: [{ msg: "Server error. Please try again later." }],
    });
  }
};

exports.CreateStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone, hostelNo } = req.body;
    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({
        success,
        errors: [{ msg: "Please provide all required fields" }],
      });
    }
    if (role === "Manager") {
      const existingManager = await Manager.findOne({ email });
      if (existingManager) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Manager with this email already exists" }],
        });
      }
      const newManager = new Manager({
        name,
        email,
        password,
        role,
        phone,
        hostelNo
      });
      await newManager.save();
      return res.status(201).json({
        success: true,
        msg: "Manager created successfully",
      });
    }
    else if (role === "Caretaker") {
      const existingCaretaker = await Caretaker.findOne({ email });
      if (existingCaretaker) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Caretaker with this email already exists" }],
        });
      }
      const newCaretaker = new Caretaker({
        name,
        email,
        password,
        role,
        phone,
        hostelNo
      });
      await newCaretaker.save();
      return res.status(201).json({
        success: true,
        msg: "Caretaker created successfully",
      });
    }
    else if (role === "Guard") {
      const existingGuard = await Guard.findOne({ email });
      if (existingGuard) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Guard with this email already exists" }],
        });
      }
      const newGuard = new Guard({
        name,
        email,
        password,
        role,
        phone,
        hostelNo
      });
      await newGuard.save();
      return res.status(201).json({
        success: true,
        msg: "Guard created successfully",
      });
    } else if (role === "PrivilegedStudent") {
      const existingPrivilegedStudent = await PrivilegedStudent.findOne({ email });
      if (existingPrivilegedStudent) {
        return res.status(400).json({
          success,
          errors: [{ msg: "PrivilegedStudent with this email already exists" }],
        });
      } 
      const newPrivilegedStudent = new PrivilegedStudent({
        name,
        email,
        password,
        role,
        phone,
        hostelNo
      });
      await newPrivilegedStudent.save();
      return res.status(201).json({
        success: true,
        msg: "PrivilegedStudent created successfully",
      });
    }
    else if (role === "Warden") {
      const existingWarden = await Warden.findOne({ email });
      if (existingWarden) {
        return res.status(400).json({
          success,
          errors: [{ msg: "Warden with this email already exists" }],
        });
      }
      const newWarden = new Warden({
        name,
        email,
        password,
        role,
        phone,
        hostelNo
      });
      await newWarden.save();
      return res.status(201).json({
        success: true,
        msg: "Warden created successfully",
      });
    }
  
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errors: [{ msg: "Server error. Please try again later." }],
    });
  }
};

exports.getAllStaffDetails = async (req, res) => {
  try {
    const [caretakers, guards, wardens, managers, privilegedStudents] = await Promise.all([
      Caretaker.find({}).select('-password'),
      Guard.find({}).select('-password'),
      Warden.find({}).select('-password'),
      Manager.find({}).select('-password'),
      PrivilegedStudent.find({}).select('-password'),
    ]);

    // Combine all staff members into one array
    const allStaff = [
      ...wardens,
      ...managers,
      ...caretakers,
      ...guards,
      ...privilegedStudents
    ];

    // Send response
    return res.status(200).json({
      success: true,
      total: allStaff.length,
      StaffDetails: allStaff,
    });
  } catch (error) {
    console.error("Error fetching staff details:", error.message);
    return res.status(500).json({
      success: false,
      errors: [{ msg: "Server error. Please try again later." }],
    });
  }
};

exports.DeleteStaff = async (req, res) => {
  try {
    const { role, id } = req.body;
    const staffId = id;
    if (!role || !staffId) {
      return res.status(400).json({
        success,
        errors: [{ msg: "Please provide role and staff ID" }],
      });
    }
    let deletedStaff;
    if (role === "Manager") {
      deletedStaff = await Manager.findByIdAndDelete(staffId);
    } else if (role === "Guard") {
      deletedStaff = await Guard.findByIdAndDelete(staffId);
    } else if (role === "Caretaker") {
      deletedStaff = await Caretaker.findByIdAndDelete(staffId);
    } else if (role === "PrivilegedStudent") {
      deletedStaff = await PrivilegedStudent.findByIdAndDelete(staffId);
    }
    else if (role === "Warden") {
      deletedStaff = await Warden.findByIdAndDelete(staffId);
    }
    if (!deletedStaff) {
      return res.status(404).json({
        success: false,
        errors: [{ msg: "Staff member not found" }],
      });
    }
    return res.status(200).json({
      success: true,
      msg: "Staff member deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, errors: [{ msg: "Server error. Please try again later." }] });
  }
};

exports.UpdateStaff = async (req, res) => {
  let success = false;
  try {
    const {email, name, phone, hostelNo, role } = req.body;
    if (!name || !email || !phone || !hostelNo) {
      return res.status(400).json({
        success,
        errors: [{ msg: "Please provide all required fields" }],
      });
    }
    // Find the staff member by email
    let staffMember;
    if (role === "Manager") {
      staffMember = await Manager.findOne({ email });
    }
     if (role === "Manager") {
      staffMember = await Manager.findOne({ email });
    } else if (role === "Guard") {
      staffMember = await Guard.findOne({ email });
    } else if (role === "Caretaker") {
      staffMember = await Caretaker.findOne({ email });
    } else if (role === "PrivilegedStudent") {
      staffMember = await PrivilegedStudent.findOne({ email });
    } else if (role === "Warden") {
      staffMember = await Warden.findOne({ email });
    }

    if (!staffMember) {
      return res.status(404).json({
        success,
        errors: [{ msg: "Staff member not found" }],
      });
    }

    // Update staff member details
    staffMember.name = name;
    staffMember.phone = phone;
    staffMember.hostelNo = hostelNo;


    await staffMember.save();

    return res.status(200).json({
      success: true,
      msg: "Staff member updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      errors: [{ msg: "Server error. Please try again later." }],
    });
  }
};

exports.changePassword = async (req, res, next) => {
  let success = false;
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password, newPassword } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success, errors: [{ msg: 'Invalid credentials' }] });
      }

      const oldPassword = await bcrypt.compare(password, user.password);

      if (!oldPassword) {
        return res.status(400).json({ success, errors: [{ msg: 'Invalid credentials' }] });
      }

      const salt = await bcrypt.genSalt(10);
      const newp = await bcrypt.hash(newPassword, salt);

      user.password = newp;
      await user.save();

      success = true;
      res.status(200).json({ success, msg: 'Password changed successfully' });

    }
    catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  } catch (error) {
    next(error);
  }
}

exports.verifySession = async (req, res, next) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success });
  }
  try {
    const { token } = req.body;
    const decoded = verifyToken(token);
    if (decoded) {
      success = true;
      return res.status(200).json({ success, data: decoded });
    }
    return res.status(400).json({ success, "message": "Invalid token" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success, "message": "Server Error" });
  }
}
