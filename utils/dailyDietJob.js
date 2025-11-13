
// const cron = require('node-cron');
// const mongoose = require('mongoose');
// const Student = require('../models/Student'); // adjust path if needed
// const Bill = require('../models/Bill');       // adjust path if needed
// const MessOff = require('../models/MessOff'); // adjust path if needed

// // Configurable prices
// const DIET_PRICE = 130;
// const REBATE_PRICE = 17;
// const DIET_NAME = "diet";
// const CLOSED_NAME = "closed";
// const REBATE_NAME = "Rebate";

// /**
//  * Helper: get current date parts in IST (India)
//  */
// function getISTDateParts() {
//   const nowUtc = new Date(Date.now());
//   const ist = new Date(nowUtc.getTime() + 5.5 * 60 * 60 * 1000);
//   return {
//     year: ist.getUTCFullYear(),
//     month: ist.getUTCMonth() + 1, // 1-12
//     date: ist.getUTCDate(),       // 1-31
//     isoDate: ist.toISOString()
//   };
// }

// /**
//  * Helper: check if student is OFF on given date (IST)
//  * rule: off if there exists a MessOff doc for student where:
//  *   leaving_date <= date AND (return_date == null OR return_date >= date)
//  *   AND status in ['approved','on_pending']
//  */
// async function isStudentOffOnDate(studentId, dateObj) {
//   // normalize to start of day
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

// /**
//  * Ensure day has a Rebate item (if not already present).
//  * Returns true if rebate was added and amount changed.
//  */
// function ensureRebateOnDay(day) {
//   day.items = day.items || [];
//   const hasRebate = day.items.some(it => String(it.name).toLowerCase() === String(REBATE_NAME).toLowerCase() && Number(it.price) === REBATE_PRICE);
//   if (!hasRebate) {
//     day.items.push({ name: REBATE_NAME, price: REBATE_PRICE });
//     return true;
//   }
//   return false;
// }

// /**
//  * Remove rebate item (if exists). Returns amount removed (0 or REBATE_PRICE).
//  */
// function removeRebateFromDay(day) {
//   if (!Array.isArray(day.items) || day.items.length === 0) return 0;
//   const idx = day.items.findIndex(it => String(it.name).toLowerCase() === String(REBATE_NAME).toLowerCase() && Number(it.price) === REBATE_PRICE);
//   if (idx >= 0) {
//     day.items.splice(idx, 1);
//     return REBATE_PRICE;
//   }
//   return 0;
// }

// /**
//  * Core job: add diet (or closed+rebate) for each student for today's date (IST)
//  * - idempotent: updates existing day entry if present
//  */

// async function addDietForAllStudents() {
//   console.log('[dailyDietJob] Starting job:', new Date().toISOString());
//   try {
//     const hostelNo=1;
//     const { year, month, date, isoDate } = getISTDateParts();
//     console.log(`[dailyDietJob] IST date => ${year}-${month}-${date} (iso: ${isoDate})`);

//     const students = await Student.find({hostelNo}, { _id: 1 }).lean();
//     if (!students || students.length === 0) {
//       console.log('[dailyDietJob] No students found.');
//       return;
//     }

//     // iterate sequentially
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
//           totalItemsAmount: 0
//         });
//         // continue below — we'll save if modified
//       }

//       // find day entry if exists
//       let day = (bill.days || []).find(d => d.date === date);

//       // check whether student is off on this date
//       const off = await isStudentOffOnDate(studentId, new Date(Date.UTC(year, month-1, date)));

//       if (!day) {
//         // no existing day -> create according to off status
//         if (off) {
//           // closed + rebate
//           const newDay = {
//             date,
//             isMessClose: true,
//             diet: { name: CLOSED_NAME, price: 0 },
//             items: [{ name: REBATE_NAME, price: REBATE_PRICE }]
//           };
//           bill.days.push(newDay);
//           // totals: diet 0, items add rebate
//           bill.totalItemsAmount = (bill.totalItemsAmount || 0) + REBATE_PRICE;
//           await bill.save();
//           console.log(`[dailyDietJob] student ${studentId} - added CLOSED + Rebate for ${year}-${month}-${date}`);
//         } else {
//           // normal diet
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

//       // day exists already -> repair or ensure correct state
//       let modified = false;

//       // normalize values
//       day.isMessClose = !!day.isMessClose;
//       day.items = day.items || [];
//       day.diet = day.diet || { name: DIET_NAME, price: DIET_PRICE };

//       const currentDietName = String(day.diet.name || "").toLowerCase();

//       // CASE 1: Student is OFF but day is not CLOSED -> convert to CLOSED
//       if (off && currentDietName !== String(CLOSED_NAME).toLowerCase()) {
//         // subtract existing diet price from totalDietAmount
//         const existingDietPrice = Number(day.diet.price || 0);
//         bill.totalDietAmount = (bill.totalDietAmount || 0) - existingDietPrice;
//         if (bill.totalDietAmount < 0) bill.totalDietAmount = 0;

//         // set closed diet
//         day.diet.name = CLOSED_NAME;
//         day.diet.price = 0;
//         day.isMessClose = true;

//         // ensure rebate present
//         const added = ensureRebateOnDay(day);
//         if (added) {
//           bill.totalItemsAmount = (bill.totalItemsAmount || 0) + REBATE_PRICE;
//         }

//         modified = true;
//         console.log(`[dailyDietJob] student ${studentId} - converted existing day -> CLOSED + rebate for ${year}-${month}-${date}`);
//       }

//       // CASE 2: Student is NOT OFF but day is CLOSED -> convert to DIET
//       if (!off && currentDietName === String(CLOSED_NAME).toLowerCase()) {
//         // remove rebate if present
//         const removed = removeRebateFromDay(day);
//         if (removed) {
//           bill.totalItemsAmount = (bill.totalItemsAmount || 0) - removed;
//           if (bill.totalItemsAmount < 0) bill.totalItemsAmount = 0;
//         }

//         // set diet back to DIET
//         day.diet.name = DIET_NAME;
//         day.diet.price = DIET_PRICE;
//         day.isMessClose = false;

//         // add diet amount
//         bill.totalDietAmount = (bill.totalDietAmount || 0) + DIET_PRICE;

//         modified = true;
//         console.log(`[dailyDietJob] student ${studentId} - converted CLOSED -> DIET for ${year}-${month}-${date}`);
//       }

//       // If neither conversion needed, do nothing (idempotent)
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

// /**
//  * Schedules the cron job — call setupDailyDietCron() after DB connect
//  */
// function setupDailyDietCron() {
//   const schedule = '0 5 * * *'; // 05:00 Asia/Kolkata daily
//   console.log('[dailyDietJob] Scheduling daily job at 05:00 Asia/Kolkata');
//   cron.schedule(
//     schedule,
//     () => {
//       addDietForAllStudents();
//     },
//     { timezone: 'Asia/Kolkata' }
//   );
// }

// module.exports = {
//   setupDailyDietCron,
//   addDietForAllStudents
// };


// jobs/dailyDietJob.js
const cron = require('node-cron');
const mongoose = require('mongoose');

const HostelSettings = require("../models/HostelSettings");
const Student = require('../models/Student');
const Bill = require('../models/Bill');
const MessOff = require('../models/MessOff');

// Names used in bills/items
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
 * Check if student has an approved/pending MessOff covering `dateObj` (using IST day boundaries)
 */
async function isStudentOffOnDate(studentId, dateObj) {
  const dayStart = new Date(dateObj);
  dayStart.setHours(0,0,0,0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23,59,59,999);

  const off = await MessOff.findOne({
    student: studentId,
    status: { $in: ['approved', 'on_pending'] },
    leaving_date: { $lte: dayEnd },
    $or: [
      { return_date: null },
      { return_date: { $gte: dayStart } }
    ]
  }).lean();

  return !!off;
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
 * Main: add diet (or closed + rebate) for all students in a particular hostel (hostelNo)
 * This function reads HostelSettings for the hostel, and uses its diet/rebate/isTodayMessOff values.
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

/**
 * Setup cron schedule - call this after mongoose DB connect
 */
function setupDailyDietCron() {
  // run every day at 05:00 IST
  const schedule = '0 5 * * *';
  console.log('[dailyDietJob] Scheduling daily job at 05:00 Asia/Kolkata');
  cron.schedule(
    schedule,
    () => {
      addDietForAllStudents().catch(err => console.error('[dailyDietJob] scheduled run error:', err));
    },
    { timezone: 'Asia/Kolkata' }
  );
}

module.exports = {
  setupDailyDietCron,
  addDietForAllStudents
};
