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
  hostelNo:{
    type:Number,
    required:true,
    enum:[1,2,3,4,5]
  }
});

module.exports = mongoose.model('Room', RoomSchema);
