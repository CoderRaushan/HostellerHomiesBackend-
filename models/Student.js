const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    urn:{
        type:Number,
        required:true,
        unique:true
    },
    room_no:{
        type:Number,
        required:true,
         unique:true
    },
    batch:{
        type:Number,
        required:true
    },
    dept:{
        type:String,
        required:true
    },
    course:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    father_name:{
        type:String,
        required:true
    },
    contact:{
        type:String,
        required:true
    },
    accountNumber:{
        type:String,
        required:true,
         unique:true
    },
    address:{
        type:String,
        required:true
    },
    dob:{
        type:Date,
        required:true
    },
    uidai:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        required:true,
        default:'Student'
    },
    password:{
        type:String,
        required:true
    },
    EventFund:{
        type:Schema.Types.ObjectId,
        ref:'EventFund'
    },
    hostelNo: 
    {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true
    },
    hostel:{
        type:Schema.Types.ObjectId,
        ref:'Hostel'
    },
    profilePhoto:{
        type:String,
        default:"https://thumbs.dreamstime.com/b/skeleton-sitting-under-moonlight-skeleton-sits-stone-gazing-full-moon-night-sky-334139675.jpg"
    }
    ,
    date:{
        type:Date,
        default:Date.now
    }
});

module.exports = Student = mongoose.model('student',StudentSchema);