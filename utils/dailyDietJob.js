

// // const cron = require('node-cron');
// // const mongoose = require('mongoose');

// const HostelSettings = require("../models/HostelSettings");
// const Student = require('../models/Student');
// const Bill = require('../models/Bill');
// const MessOff = require('../models/MessOff');

// // // Names used in bills/items
// // const DIET_NAME = "diet";
// // const CLOSED_NAME = "closed";
// // const REBATE_NAME = "Rebate";

// // /**
// //  * Helper: get current date parts in IST (India)
// //  */

// // function getISTDateParts() {
// //   const nowUtc = new Date(Date.now());
// //   const ist = new Date(nowUtc.getTime() + 5.5 * 60 * 60 * 1000);
// //   return {
// //     year: ist.getUTCFullYear(),
// //     month: ist.getUTCMonth() + 1, // 1-12
// //     date: ist.getUTCDate(),       // 1-31
// //     isoDate: ist.toISOString()
// //   };
// // }

// // /**
// //  * Check if student has an approved/pending MessOff covering `dateObj` (using IST day boundaries)
// //  */
// // async function isStudentOffOnDate(studentId, dateObj) {
// //   const dayStart = new Date(dateObj);
// //   dayStart.setHours(0,0,0,0);
// //   const dayEnd = new Date(dayStart);
// //   dayEnd.setHours(23,59,59,999);

// //   const off = await MessOff.findOne({
// //     student: studentId,
// //     status: { $in: ['approved', 'on_pending'] },
// //     leaving_date: { $lte: dayEnd },
// //     $or: [
// //       { return_date: null },
// //       { return_date: { $gte: dayStart } }
// //     ]
// //   }).lean();

// //   return !!off;
// // }

// // /**
// //  * Ensure day has a Rebate item (if not already present).
// //  * Returns true if rebate was added (so totals can be updated).
// //  */
// // function ensureRebateOnDay(day, rebatePrice) {
// //   day.items = day.items || [];
// //   const hasRebate = day.items.some(it => String(it.name).toLowerCase() === String(REBATE_NAME).toLowerCase() && Number(it.price) === Number(rebatePrice));
// //   if (!hasRebate) {
// //     day.items.push({ name: REBATE_NAME, price: rebatePrice });
// //     return true;
// //   }
// //   return false;
// // }

// // /**
// //  * Remove rebate item (if exists). Returns amount removed (0 or rebatePrice).
// //  */
// // function removeRebateFromDay(day, rebatePrice) {
// //   if (!Array.isArray(day.items) || day.items.length === 0) return 0;
// //   const idx = day.items.findIndex(it => String(it.name).toLowerCase() === String(REBATE_NAME).toLowerCase() && Number(it.price) === Number(rebatePrice));
// //   if (idx >= 0) {
// //     day.items.splice(idx, 1);
// //     return rebatePrice;
// //   }
// //   return 0;
// // }

// // /**
// //  * Main: add diet (or closed + rebate) for all students in a particular hostel (hostelNo)
// //  * This function reads HostelSettings for the hostel, and uses its diet/rebate/isTodayMessOff values.
// //  */
// // async function addDietForAllStudents() {
// //   console.log('[dailyDietJob] Starting job:', new Date().toISOString());

// //   try {
// //     // choose hostel number here (or make this function accept a parameter)
// //     const hostelNo = 1;

// //     // fetch hostel settings
// //     const hostelsetting = await HostelSettings.findOne({ hostelNo }).lean();
// //     if (!hostelsetting) {
// //       console.warn(`[dailyDietJob] No HostelSettings found for hostelNo=${hostelNo}. Aborting.`);
// //       return;
// //     }

// //     const DIET_PRICE = Number(hostelsetting.diet ?? 130);
// //     const REBATE_PRICE = Number(hostelsetting.rebate ?? 17);
// //     const isTodayMessClose = Boolean(hostelsetting.isTodayMessOff);

// //     // if today whole mess is closed for that hostel -> do nothing (as requested)
// //     if (isTodayMessClose) {
// //       console.log(`[dailyDietJob] Mess is marked OFF for hostel ${hostelNo} today (isTodayMessOff=true). No changes made.`);
// //       return;
// //     }

// //     const { year, month, date, isoDate } = getISTDateParts();
// //     console.log(`[dailyDietJob] IST date => ${year}-${month}-${date} (iso: ${isoDate}) — using DIET_PRICE=${DIET_PRICE}, REBATE_PRICE=${REBATE_PRICE}`);

// //     // fetch students only from that hostel
// //     const students = await Student.find({ hostelNo }, { _id: 1 }).lean();
// //     if (!students || students.length === 0) {
// //       console.log('[dailyDietJob] No students found for that hostel.');
// //       return;
// //     }

// //     for (const s of students) {
// //       const studentId = s._id;
// //       let bill = await Bill.findOne({ studentId, year, month });

// //       if (!bill) {
// //         bill = new Bill({
// //           studentId,
// //           year,
// //           month,
// //           days: [],
// //           totalDietAmount: 0,
// //           totalItemsAmount: 0,
// //           hostelNo
// //         });
// //       }

// //       // find day object for this date (dates stored as integer day of month)
// //       let day = (bill.days || []).find(d => Number(d.date) === Number(date));

// //       // check student off status using IST date
// //       const off = await isStudentOffOnDate(studentId, new Date(Date.UTC(year, month - 1, date)));

// //       if (!day) {
// //         // create new day entry depending on off status
// //         if (off) {
// //           // CLOSED + Rebate
// //           const newDay = {
// //             date,
// //             isMessClose: true,
// //             diet: { name: CLOSED_NAME, price: 0 },
// //             items: [{ name: REBATE_NAME, price: REBATE_PRICE }]
// //           };
// //           bill.days.push(newDay);
// //           bill.totalItemsAmount = (bill.totalItemsAmount || 0) + REBATE_PRICE;
// //           await bill.save();
// //           console.log(`[dailyDietJob] student ${studentId} - added CLOSED + Rebate for ${year}-${month}-${date}`);
// //         } else {
// //           // DIET normal
// //           const newDay = {
// //             date,
// //             isMessClose: false,
// //             diet: { name: DIET_NAME, price: DIET_PRICE },
// //             items: []
// //           };
// //           bill.days.push(newDay);
// //           bill.totalDietAmount = (bill.totalDietAmount || 0) + DIET_PRICE;
// //           await bill.save();
// //           console.log(`[dailyDietJob] student ${studentId} - added DIET ${DIET_PRICE} for ${year}-${month}-${date}`);
// //         }
// //         continue; // next student
// //       }

// //       // Day already exists — ensure correct state & totals (idempotent)
// //       let modified = false;

// //       day.isMessClose = !!day.isMessClose;
// //       day.items = day.items || [];
// //       day.diet = day.diet || { name: DIET_NAME, price: DIET_PRICE };

// //       const currentDietName = String(day.diet.name || "").toLowerCase();

// //       // CASE: student is OFF but day not CLOSED -> convert to CLOSED + rebate
// //       if (off && currentDietName !== String(CLOSED_NAME).toLowerCase()) {
// //         // subtract existing diet price from totals (defensive)
// //         const existingDietPrice = Number(day.diet.price || 0);
// //         bill.totalDietAmount = (bill.totalDietAmount || 0) - existingDietPrice;
// //         if (bill.totalDietAmount < 0) bill.totalDietAmount = 0;

// //         // set closed diet
// //         day.diet.name = CLOSED_NAME;
// //         day.diet.price = 0;
// //         day.isMessClose = true;

// //         // ensure rebate present
// //         const added = ensureRebateOnDay(day, REBATE_PRICE);
// //         if (added) {
// //           bill.totalItemsAmount = (bill.totalItemsAmount || 0) + REBATE_PRICE;
// //         }

// //         modified = true;
// //         console.log(`[dailyDietJob] student ${studentId} - converted day -> CLOSED + rebate for ${year}-${month}-${date}`);
// //       }

// //       // CASE: student is NOT OFF but day is CLOSED -> convert to DIET
// //       if (!off && currentDietName === String(CLOSED_NAME).toLowerCase()) {
// //         // remove rebate if present
// //         const removed = removeRebateFromDay(day, REBATE_PRICE);
// //         if (removed) {
// //           bill.totalItemsAmount = (bill.totalItemsAmount || 0) - removed;
// //           if (bill.totalItemsAmount < 0) bill.totalItemsAmount = 0;
// //         }

// //         // set diet back to DIET and add diet amount
// //         day.diet.name = DIET_NAME;
// //         day.diet.price = DIET_PRICE;
// //         day.isMessClose = false;
// //         bill.totalDietAmount = (bill.totalDietAmount || 0) + DIET_PRICE;

// //         modified = true;
// //         console.log(`[dailyDietJob] student ${studentId} - converted CLOSED -> DIET for ${year}-${month}-${date}`);
// //       }

// //       // CASE: day is DIET already but price differs from current DIET_PRICE (sync price)
// //       if (!off && currentDietName === String(DIET_NAME).toLowerCase()) {
// //         const existingDietPrice = Number(day.diet.price || 0);
// //         if (existingDietPrice !== DIET_PRICE) {
// //           // adjust totals to reflect new price
// //           const diff = DIET_PRICE - existingDietPrice;
// //           bill.totalDietAmount = (bill.totalDietAmount || 0) + diff;
// //           day.diet.price = DIET_PRICE;
// //           modified = true;
// //           console.log(`[dailyDietJob] student ${studentId} - updated DIET price from ${existingDietPrice} -> ${DIET_PRICE} for ${year}-${month}-${date}`);
// //         }
// //       }

// //       if (modified) {
// //         await bill.save();
// //       } else {
// //         console.log(`[dailyDietJob] student ${studentId} - day already correct for ${year}-${month}-${date}, no-op`);
// //       }
// //     }

// //     console.log('[dailyDietJob] Completed successfully.');
// //   } catch (err) {
// //     console.error('[dailyDietJob] Error:', err);
// //   }
// // }

// // /**
// //  * Setup cron schedule - call this after mongoose DB connect
// //  */
// // // function setupDailyDietCron() {
// // //   // run every day at 05:00 IST
// // //   const schedule = '0 5 * * *';
// // //   // const schedule = '27 21 * * *';
// // //   console.log('[dailyDietJob] Scheduling daily job at 05:00 Asia/Kolkata');
// // //   cron.schedule(
// // //     schedule,
// // //     () => {
// // //       addDietForAllStudents().catch(err => console.error('[dailyDietJob] scheduled run error:', err));
// // //     },
// // //     { timezone: 'Asia/Kolkata' }
// // //   );
// // // }

// // addDietForAllStudents().catch(err => console.error('[dailyDietJob] scheduled run error:', err));

// // module.exports = {
// //   addDietForAllStudents
// // };

// // runDailyDiet.js


// require('dotenv').config();
// const mongoose = require('mongoose');
// const Bill = require('../models/Bill');
// const HostelSettings = require('../models/HostelSettings');
// const { Student } = require('../models');

// async function isStudentOffOnDate(studentId, dateObj) {
//   const dayStart = new Date(dateObj);
//   dayStart.setHours(0,0,0,0);
//   const dayEnd = new Date(dayStart);
//   dayEnd.setHours(23,59,59,999);

//   const off = await MessOff.findOne({
//     student: studentId,
//     status: { $in: ['approved', 'on_pending'] },
//     leaving_date: { $lte: dayEnd },
//     $or: [
//       { return_date: null },
//       { return_date: { $gte: dayStart } }
//     ]
//   }).lean();

//   return !!off;
// }

// async function addDietForAllStudents() {
//   console.log('[dailyDietJob] Starting job:', new Date().toISOString());

//   try {
//     // choose hostel number here (or make this function accept a parameter)
//     const hostelNo = 1;

//     // fetch hostel settings
//     const hostelsetting = await HostelSettings.findOne({ hostelNo }).lean();
//     if (!hostelsetting) {
//       console.warn(`[dailyDietJob] No HostelSettings found for hostelNo=${hostelNo}. Aborting.`);
//       return;
//     }

//     const DIET_PRICE = Number(hostelsetting.diet ?? 130);
//     const REBATE_PRICE = Number(hostelsetting.rebate ?? 17);
//     const isTodayMessClose = Boolean(hostelsetting.isTodayMessOff);

//     // if today whole mess is closed for that hostel -> do nothing (as requested)
//     if (isTodayMessClose) {
//       console.log(`[dailyDietJob] Mess is marked OFF for hostel ${hostelNo} today (isTodayMessOff=true). No changes made.`);
//       return;
//     }

//     const { year, month, date, isoDate } = getISTDateParts();
//     console.log(`[dailyDietJob] IST date => ${year}-${month}-${date} (iso: ${isoDate}) — using DIET_PRICE=${DIET_PRICE}, REBATE_PRICE=${REBATE_PRICE}`);

//     // fetch students only from that hostel
//     const students = await Student.find({ hostelNo }, { _id: 1 }).lean();
//     if (!students || students.length === 0) {
//       console.log('[dailyDietJob] No students found for that hostel.');
//       return;
//     }

//     for (const s of students) {
//       const studentId = s._id;
//       let bill = await Bill.findOne({ studentId, year, month });

//       if (!bill) {
//         bill = new Bill({
//           studentId,
//           year,
//           month,
//           days: [],
//           totalDietAmount: 0,
//           totalItemsAmount: 0,
//           hostelNo
//         });
//       }

//       // find day object for this date (dates stored as integer day of month)
//       let day = (bill.days || []).find(d => Number(d.date) === Number(date));

//       // check student off status using IST date
//       const off = await isStudentOffOnDate(studentId, new Date(Date.UTC(year, month - 1, date)));

//       if (!day) {
//         // create new day entry depending on off status
//         if (off) {
//           // CLOSED + Rebate
//           const newDay = {
//             date,
//             isMessClose: true,
//             diet: { name: CLOSED_NAME, price: 0 },
//             items: [{ name: REBATE_NAME, price: REBATE_PRICE }]
//           };
//           bill.days.push(newDay);
//           bill.totalItemsAmount = (bill.totalItemsAmount || 0) + REBATE_PRICE;
//           await bill.save();
//           console.log(`[dailyDietJob] student ${studentId} - added CLOSED + Rebate for ${year}-${month}-${date}`);
//         } else {
//           // DIET normal
//           const newDay = {
//             date,
//             isMessClose: false,
//             diet: { name: DIET_NAME, price: DIET_PRICE },
//             items: []
//           };
//           bill.days.push(newDay);
//           bill.totalDietAmount = (bill.totalDietAmount || 0) + DIET_PRICE;
//           await bill.save();
//           console.log(`[dailyDietJob] student ${studentId} - added DIET ${DIET_PRICE} for ${year}-${month}-${date}`);
//         }
//         continue; // next student
//       }

//       // Day already exists — ensure correct state & totals (idempotent)
//       let modified = false;

//       day.isMessClose = !!day.isMessClose;
//       day.items = day.items || [];
//       day.diet = day.diet || { name: DIET_NAME, price: DIET_PRICE };

//       const currentDietName = String(day.diet.name || "").toLowerCase();

//       // CASE: student is OFF but day not CLOSED -> convert to CLOSED + rebate
//       if (off && currentDietName !== String(CLOSED_NAME).toLowerCase()) {
//         // subtract existing diet price from totals (defensive)
//         const existingDietPrice = Number(day.diet.price || 0);
//         bill.totalDietAmount = (bill.totalDietAmount || 0) - existingDietPrice;
//         if (bill.totalDietAmount < 0) bill.totalDietAmount = 0;

//         // set closed diet
//         day.diet.name = CLOSED_NAME;
//         day.diet.price = 0;
//         day.isMessClose = true;

//         // ensure rebate present
//         const added = ensureRebateOnDay(day, REBATE_PRICE);
//         if (added) {
//           bill.totalItemsAmount = (bill.totalItemsAmount || 0) + REBATE_PRICE;
//         }

//         modified = true;
//         console.log(`[dailyDietJob] student ${studentId} - converted day -> CLOSED + rebate for ${year}-${month}-${date}`);
//       }

//       // CASE: student is NOT OFF but day is CLOSED -> convert to DIET
//       if (!off && currentDietName === String(CLOSED_NAME).toLowerCase()) {
//         // remove rebate if present
//         const removed = removeRebateFromDay(day, REBATE_PRICE);
//         if (removed) {
//           bill.totalItemsAmount = (bill.totalItemsAmount || 0) - removed;
//           if (bill.totalItemsAmount < 0) bill.totalItemsAmount = 0;
//         }

//         // set diet back to DIET and add diet amount
//         day.diet.name = DIET_NAME;
//         day.diet.price = DIET_PRICE;
//         day.isMessClose = false;
//         bill.totalDietAmount = (bill.totalDietAmount || 0) + DIET_PRICE;

//         modified = true;
//         console.log(`[dailyDietJob] student ${studentId} - converted CLOSED -> DIET for ${year}-${month}-${date}`);
//       }

//       // CASE: day is DIET already but price differs from current DIET_PRICE (sync price)
//       if (!off && currentDietName === String(DIET_NAME).toLowerCase()) {
//         const existingDietPrice = Number(day.diet.price || 0);
//         if (existingDietPrice !== DIET_PRICE) {
//           // adjust totals to reflect new price
//           const diff = DIET_PRICE - existingDietPrice;
//           bill.totalDietAmount = (bill.totalDietAmount || 0) + diff;
//           day.diet.price = DIET_PRICE;
//           modified = true;
//           console.log(`[dailyDietJob] student ${studentId} - updated DIET price from ${existingDietPrice} -> ${DIET_PRICE} for ${year}-${month}-${date}`);
//         }
//       }

//       if (modified) {
//         await bill.save();
//       } else {
//         console.log(`[dailyDietJob] student ${studentId} - day already correct for ${year}-${month}-${date}, no-op`);
//       }
//     }

//     console.log('[dailyDietJob] Completed successfully.');
//   } catch (err) {
//     console.error('[dailyDietJob] Error:', err);
//   }
// }


// // Optional simple lock model to avoid duplicate runs (useful if main web app also schedules)
// const LockSchema = new mongoose.Schema({
//   _id: String,
//   expiresAt: Date
// }, { collection: 'job_locks' });
// const Lock = mongoose.model('Lock', LockSchema);

// async function tryAcquireLock(name, ttlMs = 5 * 60 * 1000) {
//   const now = new Date();
//   const expiresAt = new Date(now.getTime() + ttlMs);
//   const res = await Lock.findOneAndUpdate(
//     { _id: name, $or: [{ expiresAt: { $lt: now } }, { expiresAt: { $exists: false } }] },
//     { _id: name, expiresAt },
//     { upsert: true, new: true }
//   ).lean();
//   // if res.expiresAt equals our expiresAt then we acquired lock
//   return (new Date(res.expiresAt).getTime() === expiresAt.getTime());
// }

// async function run() {
//   const mongoURI = process.env.MONGODB_URI;
//   //   console.log(mongoURI);
//   if (!mongoURI) {
//     console.error('MONGODB_URI not set in env');
//     process.exit(1);
//   }

//   try {
//     console.log('[runDailyDiet] Connecting to MongoDB...');
//     await mongoose.connect(mongoURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       // optional: fail fast if cannot reach server
//       serverSelectionTimeoutMS: 10000
//     });
//     console.log('[runDailyDiet] MongoDB connected');

//     // try acquire lock to avoid duplicate runs
//     const lockName = 'dailyDietJob-lock';
//     const gotLock = await tryAcquireLock(lockName, 10 * 60 * 1000); // 10 min TTL
//     if (!gotLock) {
//       console.log('[runDailyDiet] Another runner has the lock — exiting.');
//       await mongoose.disconnect();
//       process.exit(0);
//     }

//     console.log('[runDailyDiet] Lock acquired — running job');
//     await addDietForAllStudents();

//     console.log('[runDailyDiet] Job finished — disconnecting');
//     await mongoose.disconnect();
//     process.exit(0);
//   } catch (err) {
//     console.error('[runDailyDiet] Error:', err);
//     try { await mongoose.disconnect(); } catch(e) {}
//     process.exit(1);
//   }
// }

// run();


// runDailyDiet.js
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env")
});

const mongoose = require('mongoose');

const HostelSettings = require("../models/HostelSettings");
const Student = require('../models/Student');
const Bill = require('../models/Bill');
const MessOff = require('../models/MessOff');

// Constants used in bills/items
const DIET_NAME = "diet";
const CLOSED_NAME = "closed";
const REBATE_NAME = "Rebate";

/**
 * Helper: get current date parts in IST (India)
 */
function getISTDateParts() {
  const nowUtc = new Date(Date.now());
  const ist = new Date(nowUtc.getTime() + 5.5 * 60 * 60 * 1000);
  return {
    year: ist.getUTCFullYear(),
    month: ist.getUTCMonth() + 1, // 1-12
    date: ist.getUTCDate(),       // 1-31
    isoDate: ist.toISOString()
  };
}

/**
 * Ensure day has a Rebate item (if not already present).
 * Returns true if rebate was added (so totals can be updated).
 */
function ensureRebateOnDay(day, rebatePrice) {
  day.items = day.items || [];
  const hasRebate = day.items.some(it => String(it.name).toLowerCase() === String(REBATE_NAME).toLowerCase() && Number(it.price) === Number(rebatePrice));
  if (!hasRebate) {
    day.items.push({ name: REBATE_NAME, price: rebatePrice });
    return true;
  }
  return false;
}

/**
 * Remove rebate item (if exists). Returns amount removed (0 or rebatePrice).
 */
function removeRebateFromDay(day, rebatePrice) {
  if (!Array.isArray(day.items) || day.items.length === 0) return 0;
  const idx = day.items.findIndex(it => String(it.name).toLowerCase() === String(REBATE_NAME).toLowerCase() && Number(it.price) === Number(rebatePrice));
  if (idx >= 0) {
    day.items.splice(idx, 1);
    return rebatePrice;
  }
  return 0;
}

/**
 * isStudentOffOnDate:
 * - Treat as "off" when there exists a MessOff record that covers the date range:
 *   leaving_date <= dayEnd && (return_date == null || return_date >= dayStart)
 * - Exclude only pure 'pending' requests (status === 'pending') because those are unapproved.
 * - This handles cases where status might become 'completed' quickly; date logic decides coverage.
 */
async function isStudentOffOnDate(studentId, dateObj) {
  const dayStart = new Date(dateObj);
  dayStart.setHours(0,0,0,0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23,59,59,999);

  const off = await MessOff.findOne({
    student: studentId,
    status: { $nin: ['pending'] }, // exclude only pending requests
    leaving_date: { $lte: dayEnd },
    $or: [
      { return_date: null },
      { return_date: { $gte: dayStart } }
    ]
  }).lean();

  if (off) {
    // Debug — remove or lower verbosity in production
    console.log(`[isStudentOffOnDate] found off record for student=${studentId} covering ${dayStart.toISOString().slice(0,10)}; status=${off.status}, leaving=${off.leaving_date?.toISOString()||'null'}, return=${off.return_date?.toISOString()||'null'}`);
  }
  return !!off;
}

/**
 * Main: add diet (or closed + rebate) for all students in a particular hostel (hostelNo)
 */
async function addDietForAllStudents() {
  console.log('[dailyDietJob] Starting job:', new Date().toISOString());

  try {
    // choose hostel number here (or make this function accept a parameter)
    const hostelNo = 1;

    // fetch hostel settings
    const hostelsetting = await HostelSettings.findOne({ hostelNo }).lean();
    if (!hostelsetting) {
      console.warn(`[dailyDietJob] No HostelSettings found for hostelNo=${hostelNo}. Aborting.`);
      return;
    }

    const DIET_PRICE = Number(hostelsetting.diet ?? 130);
    const REBATE_PRICE = Number(hostelsetting.rebate ?? 17);
    const isTodayMessClose = Boolean(hostelsetting.isTodayMessOff);

    // if today whole mess is closed for that hostel -> do nothing (as requested)
    if (isTodayMessClose) {
      console.log(`[dailyDietJob] Mess is marked OFF for hostel ${hostelNo} today (isTodayMessOff=true). No changes made.`);
      return;
    }

    const { year, month, date, isoDate } = getISTDateParts();
    console.log(`[dailyDietJob] IST date => ${year}-${month}-${date} (iso: ${isoDate}) — using DIET_PRICE=${DIET_PRICE}, REBATE_PRICE=${REBATE_PRICE}`);

    // fetch students only from that hostel
    const students = await Student.find({ hostelNo }, { _id: 1 }).lean();
    if (!students || students.length === 0) {
      console.log('[dailyDietJob] No students found for that hostel.');
      return;
    }

    for (const s of students) {
      const studentId = s._id;
      let bill = await Bill.findOne({ studentId, year, month });

      if (!bill) {
        bill = new Bill({
          studentId,
          year,
          month,
          days: [],
          totalDietAmount: 0,
          totalItemsAmount: 0,
          hostelNo
        });
      }

      // find day object for this date (dates stored as integer day of month)
      let day = (bill.days || []).find(d => Number(d.date) === Number(date));

      // check student off status using IST date
      const off = await isStudentOffOnDate(studentId, new Date(Date.UTC(year, month - 1, date)));

      if (!day) {
        // create new day entry depending on off status
        if (off) {
          // CLOSED + Rebate
          const newDay = {
            date,
            isMessClose: true,
            diet: { name: CLOSED_NAME, price: 0 },
            items: [{ name: REBATE_NAME, price: REBATE_PRICE }]
          };
          bill.days.push(newDay);
          bill.totalItemsAmount = (bill.totalItemsAmount || 0) + REBATE_PRICE;
          await bill.save();
          console.log(`[dailyDietJob] student ${studentId} - added CLOSED + Rebate for ${year}-${month}-${date}`);
        } else {
          // DIET normal
          const newDay = {
            date,
            isMessClose: false,
            diet: { name: DIET_NAME, price: DIET_PRICE },
            items: []
          };
          bill.days.push(newDay);
          bill.totalDietAmount = (bill.totalDietAmount || 0) + DIET_PRICE;
          await bill.save();
          console.log(`[dailyDietJob] student ${studentId} - added DIET ${DIET_PRICE} for ${year}-${month}-${date}`);
        }
        continue; // next student
      }

      // Day already exists — ensure correct state & totals (idempotent)
      let modified = false;

      day.isMessClose = !!day.isMessClose;
      day.items = day.items || [];
      day.diet = day.diet || { name: DIET_NAME, price: DIET_PRICE };

      const currentDietName = String(day.diet.name || "").toLowerCase();

      // CASE: student is OFF but day not CLOSED -> convert to CLOSED + rebate
      if (off && currentDietName !== String(CLOSED_NAME).toLowerCase()) {
        // subtract existing diet price from totals (defensive)
        const existingDietPrice = Number(day.diet.price || 0);
        bill.totalDietAmount = (bill.totalDietAmount || 0) - existingDietPrice;
        if (bill.totalDietAmount < 0) bill.totalDietAmount = 0;

        // set closed diet
        day.diet.name = CLOSED_NAME;
        day.diet.price = 0;
        day.isMessClose = true;

        // ensure rebate present
        const added = ensureRebateOnDay(day, REBATE_PRICE);
        if (added) {
          bill.totalItemsAmount = (bill.totalItemsAmount || 0) + REBATE_PRICE;
        }

        modified = true;
        console.log(`[dailyDietJob] student ${studentId} - converted day -> CLOSED + rebate for ${year}-${month}-${date}`);
      }

      // CASE: student is NOT OFF but day is CLOSED -> convert to DIET
      if (!off && currentDietName === String(CLOSED_NAME).toLowerCase()) {
        // remove rebate if present
        const removed = removeRebateFromDay(day, REBATE_PRICE);
        if (removed) {
          bill.totalItemsAmount = (bill.totalItemsAmount || 0) - removed;
          if (bill.totalItemsAmount < 0) bill.totalItemsAmount = 0;
        }

        // set diet back to DIET and add diet amount
        day.diet.name = DIET_NAME;
        day.diet.price = DIET_PRICE;
        day.isMessClose = false;
        bill.totalDietAmount = (bill.totalDietAmount || 0) + DIET_PRICE;

        modified = true;
        console.log(`[dailyDietJob] student ${studentId} - converted CLOSED -> DIET for ${year}-${month}-${date}`);
      }

      // CASE: day is DIET already but price differs from current DIET_PRICE (sync price)
      if (!off && currentDietName === String(DIET_NAME).toLowerCase()) {
        const existingDietPrice = Number(day.diet.price || 0);
        if (existingDietPrice !== DIET_PRICE) {
          // adjust totals to reflect new price
          const diff = DIET_PRICE - existingDietPrice;
          bill.totalDietAmount = (bill.totalDietAmount || 0) + diff;
          day.diet.price = DIET_PRICE;
          modified = true;
          console.log(`[dailyDietJob] student ${studentId} - updated DIET price from ${existingDietPrice} -> ${DIET_PRICE} for ${year}-${month}-${date}`);
        }
      }

      if (modified) {
        await bill.save();
      } else {
        console.log(`[dailyDietJob] student ${studentId} - day already correct for ${year}-${month}-${date}, no-op`);
      }
    }

    console.log('[dailyDietJob] Completed successfully.');
  } catch (err) {
    console.error('[dailyDietJob] Error:', err);
  }
}

/* -------------------------
   Simple lock implementation
   ------------------------- */
const LockSchema = new mongoose.Schema({
  _id: String,
  expiresAt: Date
}, { collection: 'job_locks' });
const Lock = mongoose.model('Lock', LockSchema);

async function tryAcquireLock(name, ttlMs = 5 * 60 * 1000) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);
  const res = await Lock.findOneAndUpdate(
    { _id: name, $or: [{ expiresAt: { $lt: now } }, { expiresAt: { $exists: false } }] },
    { _id: name, expiresAt },
    { upsert: true, new: true }
  ).lean();
  return (new Date(res.expiresAt).getTime() === expiresAt.getTime());
}

/* -------------------------
   Runner: connect, lock, run, disconnect
   ------------------------- */
async function run() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('MONGODB_URI not set in env');
    process.exit(1);
  }

  try {
    console.log('[runDailyDiet] Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('[runDailyDiet] MongoDB connected');

    const lockName = 'dailyDietJob-lock';
    const gotLock = await tryAcquireLock(lockName, 10 * 60 * 1000); // 10 min TTL
    if (!gotLock) {
      console.log('[runDailyDiet] Another runner has the lock — exiting.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('[runDailyDiet] Lock acquired — running job');
    await addDietForAllStudents();

    console.log('[runDailyDiet] Job finished — disconnecting');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[runDailyDiet] Error:', err);
    try { await mongoose.disconnect(); } catch(e) {}
    process.exit(1);
  }
}


if (require.main === module) {
  run();
}