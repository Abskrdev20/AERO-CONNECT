const Counter = require("../models/Counter");

async function generateGrievanceId() {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const serial = String(counter.seq).padStart(5, "0");

  return `AAI-GRV-${year}-${serial}`;
}

module.exports = generateGrievanceId;