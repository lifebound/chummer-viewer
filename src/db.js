// db.js
// PostgreSQL connection and SQL helpers for user and character storage
const winston = require('winston');
// Logger setup
const logger = winston.createLogger({
  level: 'warn',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.simple(),
    forceConsole: true,
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
  logger.info('[db.js] Enter createUser');
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );
    logger.info('[db.js] Leave createUser');
    return result.rows[0];
  } catch (err) {
    logger.error(`[db.js] Error in createUser: ${err.message}`);
    throw err;
  }
}

async function getUserByUsername(username) {
  logger.info('[db.js] Enter getUserByUsername');
  logger.debug(`[db.js] Fetching user by username: ${username}`);
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    logger.info('[db.js] Leave getUserByUsername');
    return result.rows[0];
  } catch (err) {
    logger.error(`[db.js] Error in getUserByUsername: ${err.message}`);
    throw err;
  }
}

async function getUserById(id) {
  logger.info('[db.js] Enter getUserById');
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    logger.info('[db.js] Leave getUserById');
    return result.rows[0];
  } catch (err) {
    logger.error(`[db.js] Error in getUserById: ${err.message}`);
    throw err;
  }
}

// Character helpers
async function createOrUpdateCharacter(userId, name, data) {
  logger.info('[db.js] Enter createOrUpdateCharacter');
  logger.debug(`[db.js] userId=${userId}, name=${name}`);
  try {
    const result = await pool.query(
      `INSERT INTO characters (user_id, name, data, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, name)
       DO UPDATE SET data = EXCLUDED.data, created_at = NOW()
       RETURNING id, name, created_at;`,
      [userId, name, data]
    );
    logger.info('[db.js] Leave createOrUpdateCharacter');
    logger.debug(`[db.js] Result: ${JSON.stringify(result.rows[0])}`);
    return result.rows[0];
  } catch (err) {
    logger.error(`[db.js] Error in createOrUpdateCharacter: ${err.message}`);
    throw err;
  }
}

async function getCharactersByUser(userId) {
  logger.info('[db.js] Enter getCharactersByUser');
  logger.debug(`[db.js] userId=${userId}`);
  try {
    const result = await pool.query(
      'SELECT * FROM characters WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    logger.info('[db.js] Leave getCharactersByUser');
    logger.debug(`[db.js] count=${result.rows.length}`);
    return result.rows;
  } catch (err) {
    logger.error(`[db.js] Error in getCharactersByUser: ${err.message}`);
    throw err;
  }
}

async function getCharacterById(id, userId) {
  logger.info('[db.js] Enter getCharacterById');
  logger.debug(`[db.js] id=${id}, userId=${userId}`);
  try {
    const result = await pool.query(
      'SELECT * FROM characters WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    logger.info('[db.js] Leave getCharacterById');
    return result.rows[0];
  } catch (err) {
    logger.error(`[db.js] Error in getCharacterById: ${err.message}`);
    throw err;
  }
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
