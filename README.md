# Chummer Viewer

A modern web application for uploading, parsing, and viewing Shadowrun character files, with optional user authentication and persistent character storage.

## Features
- Upload and parse Chummer5 character files (`.chum5`, `.xml`)
- Adaptive, Material-inspired navigation UI (drawer, rail, or tabs based on screen size)
- Full-page login and registration (optional, for saving/loading characters)
- Persistent character storage per user (PostgreSQL backend)
- Open-source, permissively licensed stack

## Architecture

- **Frontend:**
  - Vanilla JavaScript (ES modules)
  - Material Web Components for UI
  - Responsive/adaptive navigation (drawer, rail, tabs)
  - All logic in `/public` (see `app.js`, `navigation.js`)

- **Backend:**
  - Node.js with Express
  - PostgreSQL for user and character storage (raw SQL via `pg`)
  - Session management with `express-session` and `connect-pg-simple`
  - File upload and XML parsing for Chummer files
  - All backend logic in `/src` (see `server.js`, `db.js`)

## Requirements

- **Node.js** (v18+ recommended)
- **PostgreSQL** (v13+ recommended)
- Modern web browser (for Material Web Components)

### Node.js dependencies (see `package.json`):
- express
- body-parser
- multer
- fast-xml-parser
- xmldom
- bcrypt
- pg
- express-session
- connect-pg-simple
- uuid

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Configure PostgreSQL:**
   - Ensure PostgreSQL is running and accessible.
   - Set your connection string in the `DATABASE_URL` environment variable, e.g.:
     ```
     export DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/chummer
     ```
3. **Start the server:**
   ```sh
   npm start
   ```
4. **Open your browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

## License

This project is open source and uses a permissive license. See `LICENSE` for details.
