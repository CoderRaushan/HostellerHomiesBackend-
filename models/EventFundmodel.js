const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventFundSchema = new Schema({
    student:{
        type:Schema.Types.ObjectId,
        ref:'student'
    },
    hostel:{
        type:Schema.Types.ObjectId,
        ref:'hostel'
    },
    name:{
        type:String,
        required:true,
    },
    urn:{
        type:Number,
        required:true,
    },
    roomNumber:{
        type:Number,
        required:true
    },
    hostelNumber:{
        type:Number,
        required:true
    },
    eventDetails:{
        type:String,
        required:true
    },
    fundRequired:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:"pending",
    }
})

module.exports = Complaint = mongoose.model('EventFund',EventFundSchema);
