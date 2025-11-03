const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  roomNumber: {
    type: Number,
    required: true,
    unique: true
  },
  occupied: {
    type: Boolean,
    default: false
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'student',
    default: null
  },
  // 🖼️ (Later) Add image for room or student photo if needed
  // image: { type: String } 
});

module.exports = mongoose.model('Room', RoomSchema);
