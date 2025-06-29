// db.js
// PostgreSQL connection and SQL helpers for user and character storage
const winston = require('winston');
// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or higher to `error.log`
    //   (i.e., error, fatal, but not other levels)
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not silly)
    //
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shadowrun',
});

// Log DB connection status on startup
pool.connect()
  .then(client => {
    logger.info('[db.js] PostgreSQL connection successful');
    client.release();
  })
  .catch(err => {
    logger.error('[db.js] PostgreSQL connection failed:', err.message);
  });

// User helpers
async function createUser(username, passwordHash) {
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, passwordHash]
  );
  return result.rows[0];
}

async function getUserByUsername(username) {
    logger.debug(`[db.js] Fetching user by username: ${username}`);
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  logger.silly(`[db.js] User fetched: ${JSON.stringify(result.rows[0])}`);
  return result.rows[0];
}

async function getUserById(id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Character helpers
async function createOrUpdateCharacter(userId, name, data) {
  logger.debug(`[db.js] Enter createOrUpdateCharacter: userId=${userId}, name=${name}`);
  const result = await pool.query(
    `INSERT INTO characters (user_id, name, data, created_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, name)
     DO UPDATE SET data = EXCLUDED.data, created_at = NOW()
     RETURNING id, name, created_at;`,
    [userId, name, data]
  );
  logger.debug(`[db.js] Exit createOrUpdateCharacter: result=${JSON.stringify(result.rows[0])}`);
  return result.rows[0];
}

async function getCharactersByUser(userId) {
  logger.debug(`[db.js] Enter getCharactersByUser: userId=${userId}`);
  const result = await pool.query(
    'SELECT * FROM characters WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  logger.debug(`[db.js] Exit getCharactersByUser: count=${result.rows.length}`);
  return result.rows;
}

async function getCharacterById(id, userId) {
  const result = await pool.query(
    'SELECT * FROM characters WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0];
}

module.exports = {
  pool,
  createUser,
  getUserByUsername,
  getUserById,
  createOrUpdateCharacter,
  getCharactersByUser,
  getCharacterById,
};
