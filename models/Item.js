// models/Item.js
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique:true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        rebate: {
            type: Number,
            default: 0,
            min: 0
        },
        isTodayMessOff: {
            type: Boolean,
            default: false
        },
        diet: {
            type: Number,
            default: 0,
            min: 0
        },

        hostelNo: {
            type: String,
            required: true,
            index: true
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
