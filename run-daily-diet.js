import runDailyDietJob from "./utils/dailyDietJob.js";

(async () => {
  console.log("Starting Daily Diet Job:", new Date());
  await runDailyDietJob();
  console.log("Finished Daily Diet Job:", new Date());
})();
