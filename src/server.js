const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { readFile } = require('fs').promises;
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
const { parseCharacter } = require('./parseCharacter');
const { v4: uuidv4 } = require('uuid');
//const { DOMParser, XMLSerializer } = require('jsdom');
const bcrypt = require('bcrypt');
const db = require('./db');
const { sessionMiddleware } = require('./session');
const winston = require('winston');
const app = express();
const upload = multer({ dest: 'uploads/' });

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
    //   (i.e., fatal, error, warn, and info, but not trace)
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

// Info: server start
logger.info('[server.js] Server starting...');

// Middleware setup
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup (PostgreSQL)
app.use(sessionMiddleware);

// Info: configuration assumptions
logger.info(`[server.js] Using default session store configuration.`);

// Auth middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required' });
  next();
}

// Content Security Policy middleware (place at the very top, before static)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self' https://unpkg.com https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "script-src 'self' 'unsafe-inline' https://unpkg.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:;"
  );
  next();
});

app.use(express.static(path.join(__dirname, '../public')));

// Trace IP middleware
app.use((req, res, next) => {
  logger.info(`[server.js] Connection from IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
  next();
});

app.post('/upload', upload.single('character'), async (req, res) => {
  logger.debug("UPLOAD ROUTE HIT!");
  process.stdout.write("Definitely flushing to stdout\n");
  logger.silly('Request headers:', req.headers);
  logger.silly('Request file:', req.file);
  logger.silly('Request body:', req.body);
  if (!req.file) {
    logger.error('No file uploaded.');
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  try {
    const xml = await readFile(req.file.path, 'utf-8');
    const parser = new XMLParser();
    const json = parser.parse(xml);
    // Sanitize alias for filename
    const summary = parseCharacter(json);
    const safeAlias = (summary.name || 'character').replace(/[^a-zA-Z0-9_-]/g, '_');
    fs.writeFileSync(`debug-chummer-dump-${safeAlias}.json`, JSON.stringify(json, null, 2));
    // If authenticated, store JSON in DB
    if (req.session && req.session.userId) {
      logger.debug(`[server.js] Authenticated upload: storing character for userId=${req.session.userId}, name=${summary.name}`);
      try {
        await db.createOrUpdateCharacter(req.session.userId, summary.name, json);
        logger.debug(`[server.js] Character stored in DB for userId=${req.session.userId}, name=${summary.name}`);
      } catch (err) {
        logger.error(`[server.js] Error storing character in DB: ${err.stack || err}`);
      }
    } else {
      logger.debug('[server.js] Unauthenticated upload: not storing character in DB');
    }
    res.json(summary);
  } catch (err) {
    logger.error('Error parsing character:', err);
    res.status(500).json({ error: 'Error parsing XML', details: err.message });
  }
});

app.post('/append-job', upload.single('character'), async (req, res) => {
  try {
    logger.debug('[APPEND-JOB] Request received');
    if (!req.file) {
      logger.debug('[APPEND-JOB] No file uploaded');
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const xml = await readFile(req.file.path, 'utf-8');
    logger.silly('[APPEND-JOB] Original XML loaded' );
    const parser = new XMLParser();
    let doc = parser.parse(xml);
    
    const jsonObj = {
      "?xml": {
        "@_version": "1.0",
        "@_encoding": "UTF-8"
      },
      character: {}
    };
    logger.silly('[APPEND-JOB] XML parsed successfully', doc);
    let jobs = [];
    if (Array.isArray(req.body.jobs)) {
      jobs = JSON.parse(req.body.jobs);
    } else if (req.body.jobs) {
      jobs = [JSON.parse(req.body.jobs)];
    } else {
      jobs = [{
        karma: req.body.karmaEarned,
        nuyen: req.body.nuyenEarned,
        comment: req.body.comment
      }];
    }
    logger.silly('[APPEND-JOB] Jobs to process:', jobs);
    let karmaSum = 0;
    let nuyenSum = 0;
    const now = new Date().toISOString();
    // Find or create <expenses>
    let expenses = doc.character.expenses.expense || [];
    logger.silly('[APPEND-JOB] Existing expenses:', expenses);
    for (const job of jobs) {
      // Only create an <expense> if the value is a positive number
      const karmaVal = Number(job.karma);
      const nuyenVal = Number(job.nuyen);
      if (!isNaN(karmaVal) && karmaVal > 0) {
        karmaSum += karmaVal;
        
        const expense = createExpenseEntry(
          require('uuid').v4(),
          now,
          karmaVal,
          job.comment || '',
          'Karma',
          'False',
          'False',
          'ManualAdd',
          '',
          '',
          '0',
          ''
        );
        expenses.push(expense);
        logger.silly('[APPEND-JOB] Added Karma expense:', expense);
      }
      if (!isNaN(nuyenVal) && nuyenVal > 0) {
        nuyenSum += nuyenVal;
        const expense = createExpenseEntry(
          require('uuid').v4(),
          now,
          nuyenVal,
          job.comment || '',
          'Nuyen',
          'False',
          'False',
          '',
          'ManualAdd',
          '',
          '0',
          ''
        );
        expenses.push(expense);
        logger.silly('[APPEND-JOB] Added Nuyen expense:', expense);
      }
    }
    doc.character.expenses.expense = expenses;
    jsonObj.character = doc.character;

    logger.silly('[APPEND-JOB] new expenses:', doc.character.expenses);
    logger.silly('[APPEND-JOB] New character object:', jsonObj);
    // Update <karma> and <nuyen>
    // Serialize and send
    const builder = new XMLBuilder({ format: true, indentBy: '   ',ignoreAttributes: false });
    const updatedXml = builder.build(jsonObj);
    //console.log('[APPEND-JOB] XML updated successfully', updatedXml);
    // Determine output file extension based on uploaded file
    let characterName = jsonObj.character.alias || 'character';
    let playableStatus = (jsonObj.character.created === "True" ? 'Playable' : 'Create');
    let filename = `${characterName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${playableStatus}.xml`;
    logger.debug(`[APPEND-JOB] Final filename: ${filename}`);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/xml');
    res.send(updatedXml);
  } catch (err) {
    logger.error('Error appending job:', err);
    res.status(500).json({ error: 'Error appending job', details: err.message });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const existing = await db.getUserByUsername(username);
    if (existing) return res.status(400).json({ error: 'Username already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.createUser(username, passwordHash);
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ success: true });
  } catch (e) {
    logger.error('Registration failed:', e);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  logger.debug(`[server.js] Login attempt for username: ${username}`);
  const user = await db.getUserByUsername(username);
  if (!user) {
    logger.debug(`[server.js] Login failed: user not found`);
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    logger.debug(`[server.js] Login failed: password mismatch`);
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  logger.debug(`[server.js] Login successful for userId: ${user.id}`);
  // Check for stored character data after login
  let chars = [];
  try {
    chars = await db.getCharactersByUser(user.id);
    logger.silly(`[server.js] Character lookup for login: userId=${user.id}, count=${chars.length}`);
    if (chars.length > 0) {
      chars.forEach(c => logger.silly(`[server.js] Character: id=${c.id}, name=${c.name}`));
    }
  } catch (e) {
    logger.error('[server.js] Error fetching characters for login:', e);
  }
  res.json({ success: true, characters: chars });
});

// Logout
app.post('/api/logout', (req, res) => {
  logger.debug(`[server.js] Logout request for userId: ${req.session.userId}`);
  req.session.destroy(() => res.json({ success: true }));
});

// Save or update character (requires login)
app.post('/api/character', requireLogin, async (req, res) => {
  const { name, data } = req.body;
  if (!name || !data) return res.status(400).json({ error: 'Name and data required' });
  try {
    const character = await db.createOrUpdateCharacter(req.session.userId, name, data);
    res.json({ success: true, character });
  } catch (err) {
    logger.error('Error in createOrUpdateCharacter:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get user's characters (requires login)
app.get('/api/characters', requireLogin, async (req, res) => {
  logger.debug(`[server.js] Checking for stored character data for userId: ${req.session.userId}`);
  const chars = await db.getCharactersByUser(req.session.userId);
  if (chars.length > 0) {
    logger.silly(`[server.js] Found ${chars.length} character(s) for userId: ${req.session.userId}`);
  } else {
    logger.silly(`[server.js] No characters found for userId: ${req.session.userId}`);
  }
  res.json(chars);
});

// Session status endpoint
app.get('/api/session', async (req, res) => {
  if (req.session && req.session.userId) {
    logger.debug(`[server.js] Session check: logged in as userId ${req.session.userId}`);
    // Look up characters for this user
    let chars = [];
    try {
      chars = await db.getCharactersByUser(req.session.userId);
      logger.silly(`[server.js] Character lookup for session: userId=${req.session.userId}, count=${chars.length}`);
      if (chars.length > 0) {
        chars.forEach(c => logger.silly(`[server.js] Character: id=${c.id}, name=${c.name}`));
      }
    } catch (e) {
      logger.error('[server.js] Error fetching characters for session:', e);
    }
    res.json({ loggedIn: true, username: req.session.username || null, characters: chars });
  } else {
    logger.debug(`[server.js] Session check: not logged in`);
    res.json({ loggedIn: false, characters: [] });
  }
});

function createElementWithText(doc, tag, text) {
  const el = doc.createElement(tag);
  el.appendChild(doc.createTextNode(String(text)));
  return el;
}

// Ensure database tables exist (run at startup)
async function ensureTables() {
  await db.pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `);
  await db.pool.query(`
    CREATE TABLE IF NOT EXISTS characters (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
function createExpenseEntry(guid,date,amount,reason,type,refund,forceCareerVisible,karmatype,nuyentype,objectid,qty,extra) {
  return {
    guid,
    date,
    amount,
    reason,
    type,
    refund,
    forceCareerVisible,
    undo: {
      karmatype,
      nuyentype,
      objectid,
      qty,
      extra
    }
  };
}

// Confirm PostgreSQL connection on startup
db.pool.connect()
  .then(client => {
    client.release();
  })
  .catch(err => {
    logger.error('[server.js] PostgreSQL connection failed:', err.message);
  });

ensureTables();

// Listen on all interfaces for mobile access
const PORT = 3000;
app.listen(PORT, '0.0.0.0');
