const mongoose = require("mongoose");
const superAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum:
      ["SuperAdmin", "Caretaker", "Manager", "Warden", "Guard", "PrivilegeStudent"
      ]
  },
  profilePhoto: {
    type: String,
    default: "",
  },
}, { timestamps: true });

const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);

module.exports = SuperAdmin;
