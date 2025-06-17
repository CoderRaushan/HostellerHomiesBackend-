const { validationResult } = require('express-validator');
const { Invoice, MessOff, Student } = require('../models');
const { Mess_bill_per_day } = require('../constants/mess');

// @route   Generate api/invoice/generate
// @desc    Generate invoice
// @access  Public
exports.generateInvoices = async (req, res) => {
    let success = false;
    const { hostel } = req.body;
    const students = await Student.find({ hostel });
<<<<<<< HEAD
    console.log(students);

    // const invoices = await Invoice.find({ student: { $in: students }, date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } })
    // if (invoices.length === students.length) {
    //     return res.status(400).json({ errors: 'Invoices already generated', success });
    // }

    // // get days in previous month
    // let daysinlastmonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate();

    // let amount = Mess_bill_per_day * daysinlastmonth;
    // count = 0;
    // students.map(async (student) => {
    //     let messoff = await MessOff.find({ student: student });
    //     if (messoff) {
    //         messoff.map((messoffone) => {
    //             if (messoffone.status === 'approved' && messoffone.return_date.getMonth() + 1 === new Date().getMonth()) {
    //                 let leaving_date = messoffone.leaving_date;
    //                 let return_date = messoffone.return_date;
    //                 let number_of_days = (return_date - leaving_date) / (1000 * 60 * 60 * 24);
    //                 amount -= Mess_bill_per_day * number_of_days;
    //             }
    //         });
    //     }

    //     try {
    //         let invoice = new Invoice({
    //             student,
    //             amount
    //         });
    //         await invoice.save();
    //         count++;
    //     }
    //     catch (err) {
    //         console.error(err.message);
    //         res.status(500).send('Server error');
    //     }
    // });
    // success = true;
    // res.status(200).json({ success, count });

}


exports.updateStudent = async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
=======
    const invoices = await Invoice.find({
        student: { $in: students },
        date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    if (invoices.length === students.length) {
        return res.status(400).json({ errors: 'Invoices already generated', success });
>>>>>>> dfe37f2c9917fd9182fcebeda1ca610c554f68b1
    }

    const {
        name, urn, room_no, batch, dept, course,
        email, father_name, contact, address,
        dob, uidai, hostel, password
    } = req.body;

<<<<<<< HEAD
    try {
        const studentId = req.params.id; 
        let student = await Student.findById(studentId).populate('user');
        if (!student) {
            return res.status(404).json({ success, errors: [{ msg: 'Student not found' }] });
        }

        // Check if email or URN is being updated and already exists for another student
        if (email !== student.email) {
            const emailExists = await Student.findOne({ email });
            if (emailExists && emailExists._id.toString() !== studentId) {
                return res.status(400).json({ success, errors: [{ msg: 'Email already in use' }] });
            }

            // Also update email in User model
            await User.findByIdAndUpdate(student.user, { email });
        }

        if (urn !== student.urn) {
            const urnExists = await Student.findOne({ urn });
            if (urnExists && urnExists._id.toString() !== studentId) {
                return res.status(400).json({ success, errors: [{ msg: 'URN already in use' }] });
            }
        }

        if (uidai !== student.uidai) {
            const uidaiExists = await Student.findOne({ uidai });
            if (uidaiExists && uidaiExists._id.toString() !== studentId) {
                return res.status(400).json({ success, errors: [{ msg: 'UIDAI already in use' }] });
            }
        }

        // Update hostel if needed
        let shostel = student.hostel;
        if (hostel && student.hostel.toString() !== hostel) {
            const foundHostel = await Hostel.findOne({ name: hostel });
            if (!foundHostel) {
                return res.status(400).json({ success, errors: [{ msg: 'Hostel not found' }] });
            }
            shostel = foundHostel._id;
        }

        // Update password if provided
        let updatedPassword = undefined;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedPassword = await bcrypt.hash(password, salt);
            await User.findByIdAndUpdate(student.user, { password: updatedPassword });
        }

        // Now update student fields
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
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
                hostel: shostel
            },
            { new: true }
        );

        success = true;
        res.status(200).json({ success, student: updatedStudent });

    } catch (err) {
        console.error("Error in updateStudent:", err);
        if (err.code === 11000) {
            return res.status(400).json({ success, errors: [{ msg: 'Duplicate entry. Email, URN or UIDAI already exists.' }] });
        }
        res.status(500).json({ success, errors: [{ msg: 'Server error' }] });
    }
};



=======
    let count = 0;
    try {
        await Promise.all(students.map(async (student) => {
            let amount = Mess_bill_per_day * daysinlastmonth;
            let messoff = await MessOff.find({ student: student });
            if (messoff) {
                messoff.forEach((messoffone) => {
                    if (messoffone.status === 'approved' && messoffone.return_date.getMonth() + 1 === new Date().getMonth()) {
                        let leaving_date = messoffone.leaving_date;
                        let return_date = messoffone.return_date;
                        let number_of_days = (return_date - leaving_date) / (1000 * 60 * 60 * 24);
                        amount -= Mess_bill_per_day * number_of_days;
                    }
                });
            }
            let invoice = new Invoice({
                student,
                amount
            });
            await invoice.save();
            count++;
        }));
        success = true;
        res.status(200).json({ success, count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
>>>>>>> dfe37f2c9917fd9182fcebeda1ca610c554f68b1
// @route   GET api/invoice/getbyid
// @desc    Get all invoices
// @access  Public
exports.getInvoicesbyid = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }
    const { hostel } = req.body;
    let student = await Student.find({ hostel: hostel });
    try {
        let invoices = await Invoice.find({ student: student }).populate('student', ['name', 'room_no', 'urn']);
        success = true;
        res.status(200).json({ success, invoices });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

// @route   GET api/invoice/student
// @desc    Get all invoices
// @access  Public
exports.getInvoices = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }
    const { student } = req.body;
    try {
        let invoices = await Invoice.find({ student: student });
        success = true;
        res.status(200).json({ success, invoices });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

// @route   GET api/invoice/update
// @desc    Update invoice
// @access  Public
exports.updateInvoice = async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), success });
    }
    const { student, status } = req.body;
    try {
        let invoice = await Invoice.findOneAndUpdate({ student: student, date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, { status: status });
        success = true;
        res.status(200).json({ success, invoice });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}
