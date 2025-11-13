// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const MessOffSchema = new Schema({
//     student:{
//         type:Schema.Types.ObjectId,
//         ref:'student'
//     },
//     leaving_date:{
//         type:Date,
//         required:true
//     },
//     return_date:{
//         type:Date,
//         required:true
//     },
//     status:{
//         type:String,
//         default:'pending'
//     },
//     request_date:{
//         type:Date,
//         default:Date.now
//     }
// })

// module.exports = MessOff = mongoose.model('messoff',MessOffSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessOffSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'student',
    required: true
  },
  leaving_date: {
    type: Date,
    required: true
  },
  // optional — will be filled when student requests "mess on" and admin approves
  return_date: {
    type: Date,
    required: false,
    default: null
  },
  // statuses:
  // 'pending' -> off request pending
  // 'approved' -> off approved (student is off, no return_date yet)
  // 'on_pending' -> student requested to come back (pending)
  // 'completed' -> on approved (return_date set — off period closed)
  status: {
    type: String,
    default: 'pending'
  },
  request_date: {
    type: Date,
    default: Date.now
  }
});

module.exports = MessOff = mongoose.model('messoff', MessOffSchema);
