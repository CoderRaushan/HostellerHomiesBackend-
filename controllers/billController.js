// controllers/billController.js
const mongoose = require("mongoose");
const Bill = require("../models/Bill.js");
const Student= require("../models/Student.js");
exports.getBillForStudent = async (req, res) => {
  try {
    const { studentId, month, year } = req.body;
    if (!studentId || !month || !year) {
      return res.status(400).json({ success: false, message: "studentId, month and year required" });
    }
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: "Invalid studentId" });
    }

    const bill = await Bill.findOne({ studentId, month, year }).lean();

    if (!bill) {
      // return skeleton so frontend can show empty calendar
      return res.json({
        success: true,
        bill: {
          studentId,
          month,
          year,
          days: [],
          totalDietAmount: 0,
          totalItemsAmount: 0,
          createdAt: new Date()
        }
      });
    }

    // ensure totals are consistent (recompute)
    const computed = (bill.days || []).reduce((acc, d) => {
      const diet = d.diet && typeof d.diet.price === "number" ? Number(d.diet.price) : 0;
      const items = Array.isArray(d.items) ? d.items.reduce((s, it) => s + (Number(it.price) || 0), 0) : 0;
      acc.diet += diet;
      acc.items += items;
      return acc;
    }, { diet: 0, items: 0 });

    bill.totalDietAmount = computed.diet;
    bill.totalItemsAmount = computed.items;

    return res.json({ success: true, bill });
  } catch (err) {
    console.error("getBillForStudent error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getBillsForHostel = async (req, res) => {
  try {
    const { hostelNo, month, year } = req.body;
    if (!hostelNo || !month || !year) {
      return res.status(400).json({ success: false, message: "hostelNo, month and year required" });
    }

   
    // find students in hostel
    const students = await Student.find({ hostelNo }).select("_id name accountNumber room_no urn").lean();

    // days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    // prepare result array
    const rows = [];

    // fetch bills for all students in parallel (but limit concurrency if very large)
    // We'll do Promise.all for simplicity
    await Promise.all(students.map(async (stu) => {
      const bill = await Bill.findOne({ studentId: stu._id, month, year }).lean();

      // build days map for easy lookup
      const daysMap = {};
      if (bill && Array.isArray(bill.days)) {
        for (const d of bill.days) daysMap[d.date] = d;
      }

      // build day cells list (1..daysInMonth)
      const dayCells = [];
      let guestsTotal = 0;
      let rebateTotal = 0;
      let closedDays = 0;
      let dietTotal = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const d = daysMap[day];
        if (!d) {
          dayCells.push(null); // no entry
          continue;
        }

        // determine closed
        const isClosed = d.isMessClose === true || (d.diet && String(d.diet.name || "").toLowerCase() === "closed");

        // diet price (0 if closed or not set)
        const dietPrice = (d.diet && typeof d.diet.price === "number") ? d.diet.price : 0;
        dietTotal += dietPrice;

        // items sum and items list
        const items = Array.isArray(d.items) ? d.items.map(it => ({ name: it.name, price: Number(it.price || 0) })) : [];
        let itemsSum = 0;
        for (const it of items) {
          if (String(it.name || "").toLowerCase() === "rebate") {
            rebateTotal += it.price;
          } else {
            itemsSum += it.price;
            guestsTotal += it.price;
          }
        }

        if (isClosed) closedDays++;

        dayCells.push({
          date: day,
          isClosed,
          diet: d.diet || null,
          items,
          itemsSum
        });
      }

      // compute total for this row
      const total = dietTotal + guestsTotal + rebateTotal;

      rows.push({
        studentId: stu._id,
        name: stu.name,
        accountNumber: stu.accountNumber,
        room_no: stu.room_no,
        days: dayCells, // array length daysInMonth with null or object
        totals: {
          dietTotal,
          guestsTotal,
          rebateTotal,
          closedDays,
          total
        }
      });
    }));

    // respond with structure
    return res.json({
      success: true,
      month,
      year,
      daysInMonth,
      rows
    });
  } catch (err) {
    console.error("getBillsForHostel error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};