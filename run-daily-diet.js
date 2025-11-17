// run-daily-diet.js (CommonJS)
const runDailyDietJob = require('./utils/dailyDietJob.js');

(async () => {
  console.log("Starting Daily Diet Job:", new Date());
  try {
    await runDailyDietJob();
    console.log("Finished Daily Diet Job:", new Date());
    process.exit(0);
  } catch (err) {
    console.error('runDailyDietJob failed:', err);
    process.exit(1);
  }
})();
