// PostgreSQL-backed session store for Express
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./db');

module.exports = {
  sessionMiddleware: session({
    store: new pgSession({ pool }),
    secret: process.env.SESSION_SECRET || 'chummersecret',
    resave: false,
    saveUninitialized: false,
  })
};
