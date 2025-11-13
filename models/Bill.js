const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }
});

const daySchema = new mongoose.Schema({
    date: { type: Number, required: true }, // 1–31

    // jab bhi kisi date ko diet add karna ho to pehle isMessClose ko false karo
    isMessClose: { type: Boolean, default: true },

    diet: {
        name: { type: String, required: true, default: "diet" }, // "diet" hamesha same name rahega by default
        price: { type: Number, required: true }
    },

    items: [itemSchema] // Extra items taken on this date
});

const billSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },

    year: { type: Number, required: true },
    month: { type: Number, required: true }, // 1–12

    days: [daySchema],  // All dates food details

    totalDietAmount: { type: Number, default: 0 },
    totalItemsAmount: { type: Number, default: 0 },
    hostelNo: {
        type: String,
        require: true,
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bill", billSchema);
