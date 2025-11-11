const mongoose = require("mongoose");

const guardSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  shift: { 
    type: String, 
    enum: ["Day", "Night"], 
  },
  post: { 
    type: String, 
    // required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  profilePhoto: {
    type: String,
    default: 'https://st.depositphotos.com/2101611/3925/v/450/depositphotos_39258143-stock-illustration-businessman-avatar-profile-picture.jpg'
  },
    role: {
    type: String,
    default: 'Guard',
    required: true 
  },
    hostelNo: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true
  },
  status: { 
    type: String, 
    enum: ["Active", "Inactive"], 
    default: "Inactive" 
  },
});

module.exports = mongoose.model("Guards", guardSchema);

