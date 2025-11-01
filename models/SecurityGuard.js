const mongoose = require("mongoose");

const guardSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  guardId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  shift: { 
    type: String, 
    enum: ["Day", "Night"], 
    required: true 
  },
  post: { 
    type: String, 
    required: true 
  },
  contact: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Active", "Inactive"], 
    default: "Inactive" 
  },
});

module.exports = mongoose.model("Guards", guardSchema);
