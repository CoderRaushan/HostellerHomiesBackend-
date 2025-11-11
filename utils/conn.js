const mongoose = require('mongoose');
require('dotenv').config();
const SuperAdmin = require("../models/SuperAdmin.js");
const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connection SUCCESS');
        // await InitSuperAdmin();
    } catch (error) {
        console.error('MongoDB connection FAIL');
        process.exit(1);
    }
};
const data = {
    name: "SuperAdmin",
    email: "superadmin@gmail.com",
    password: "superadmin",
    phoneNo: "7631867534",
    address: "Ludhiana, Punjab, India",
    role: "SuperAdmin",
    profilePhoto: "https://res.cloudinary.com/duthu0r3j/image/upload/v1761640341/QuickChat/photo-1761640337192.jpg"
}
const InitSuperAdmin = async () => {
    try {
        const isExistsuperadmin = await SuperAdmin.findOne({ email: data.email });
        if (isExistsuperadmin) {
            console.log("SuperAdmin Already registered");
        } else {
            const superadmin = new SuperAdmin(data);
            await superadmin.save();
            console.log("SuperAdmin registered Successfully!");
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB;