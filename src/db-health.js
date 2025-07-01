// db-health.js
// Simple health check for PostgreSQL connection
const db = require('./db');

async function checkDbHealth() {
  try {
    await db.pool.query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = { checkDbHealth };
