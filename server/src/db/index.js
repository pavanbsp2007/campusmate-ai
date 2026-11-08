const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
require('dotenv').config();

let dbType = process.env.DB_TYPE || 'sqlite';
let mysqlPool = null;
let sqliteDb = null;

const db = {
  type: dbType,

  async init() {
    console.log(`[Database] Initializing database engine (Preferred: ${dbType})...`);

    if (dbType === 'mysql') {
      try {
        mysqlPool = mysql.createPool({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306', 10),
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'campusmate',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
        });

        // Test connection
        const connection = await mysqlPool.getConnection();
        console.log('[Database] Connected to MySQL successfully!');
        connection.release();
        await this.runSchemaMySQL();
        return;
      } catch (err) {
        console.warn(`[Database] MySQL connection failed (${err.message}). Falling back automatically to SQLite for seamless execution.`);
        dbType = 'sqlite';
        this.type = 'sqlite';
      }
    }

    // SQLite fallback or default
    return new Promise((resolve, reject) => {
      const dbPath = path.resolve(__dirname, '../../../database/campusmate.sqlite');
      sqliteDb = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          console.error('[Database] Failed to open SQLite database:', err);
          return reject(err);
        }
        console.log(`[Database] Connected to SQLite database at: ${dbPath}`);
        try {
          await this.runSchemaSQLite();
          resolve();
        } catch (schemaErr) {
          reject(schemaErr);
        }
      });
    });
  },

  async query(sql, params = []) {
    if (this.type === 'mysql' && mysqlPool) {
      const [rows] = await mysqlPool.query(sql, params);
      return rows;
    } else {
      return new Promise((resolve, reject) => {
        const trimmed = sql.trim().toUpperCase();
        if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('SHOW')) {
          sqliteDb.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
          });
        } else {
          sqliteDb.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ affectedRows: this.changes, insertId: this.lastID });
          });
        }
      });
    }
  },

  async runSchemaMySQL() {
    try {
      const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        for (const stmt of statements) {
          await mysqlPool.query(stmt);
        }
        console.log('[Database] MySQL tables verified/initialized.');
      }
    } catch (e) {
      console.error('[Database] Error checking MySQL schema:', e.message);
    }
  },

  async runSchemaSQLite() {
    return new Promise((resolve, reject) => {
      sqliteDb.serialize(async () => {
        // Enable foreign keys
        sqliteDb.run('PRAGMA foreign_keys = ON;');

        // Check if users table exists
        sqliteDb.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", async (err, row) => {
          if (err) return reject(err);

          if (!row) {
            console.log('[Database] Creating tables in SQLite...');
            const tables = [
              `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'student',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )`,
              `CREATE TABLE IF NOT EXISTS student_profiles (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                full_name TEXT NOT NULL,
                college_name TEXT NOT NULL,
                course TEXT NOT NULL,
                semester INTEGER NOT NULL DEFAULT 1,
                academic_year TEXT NOT NULL,
                avatar_url TEXT,
                bio TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS subscriptions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                plan_tier TEXT DEFAULT 'free',
                status TEXT DEFAULT 'active',
                start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                expiry_date DATETIME NULL,
                razorpay_payment_id TEXT,
                ai_queries_used_today INTEGER DEFAULT 0,
                ai_queries_limit INTEGER DEFAULT 5,
                last_reset_date TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS subjects (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                code TEXT,
                name TEXT NOT NULL,
                credits INTEGER DEFAULT 3,
                professor TEXT,
                color TEXT DEFAULT '#4F46E5',
                semester INTEGER DEFAULT 1,
                target_attendance_pct INTEGER DEFAULT 75,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS attendance (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT NOT NULL,
                total_classes INTEGER DEFAULT 0,
                attended_classes INTEGER DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, subject_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS attendance_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT NOT NULL,
                log_date TEXT NOT NULL,
                status TEXT NOT NULL,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS assignments (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                due_date DATETIME NOT NULL,
                priority TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'pending',
                submission_link TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
              )`,
              `CREATE TABLE IF NOT EXISTS timetables (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT NOT NULL,
                day_of_week TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                room_number TEXT,
                building TEXT,
                instructor TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS examinations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT NOT NULL,
                exam_name TEXT NOT NULL,
                exam_date TEXT NOT NULL,
                start_time TEXT,
                duration_minutes INTEGER DEFAULT 180,
                room_number TEXT,
                syllabus_topics TEXT,
                target_score INTEGER DEFAULT 85,
                is_completed INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS semester_grades (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                semester INTEGER NOT NULL,
                subject_name TEXT NOT NULL,
                credits INTEGER NOT NULL DEFAULT 3,
                grade_letter TEXT NOT NULL,
                grade_points REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS study_goals (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT,
                title TEXT NOT NULL,
                target_date TEXT NOT NULL,
                target_hours REAL DEFAULT 2.0,
                completed_hours REAL DEFAULT 0.0,
                is_completed INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
              )`,
              `CREATE TABLE IF NOT EXISTS study_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT,
                session_type TEXT DEFAULT 'pomodoro',
                duration_minutes INTEGER NOT NULL,
                notes TEXT,
                session_date TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
              )`,
              `CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT,
                file_path TEXT,
                file_type TEXT,
                is_favorite INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
              )`,
              `CREATE TABLE IF NOT EXISTS flashcard_decks (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT,
                title TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
              )`,
              `CREATE TABLE IF NOT EXISTS flashcards (
                id TEXT PRIMARY KEY,
                deck_id TEXT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                difficulty TEXT DEFAULT 'medium',
                review_count INTEGER DEFAULT 0,
                last_reviewed_at DATETIME NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS quizzes (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_id TEXT,
                title TEXT NOT NULL,
                topic TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
              )`,
              `CREATE TABLE IF NOT EXISTS quiz_questions (
                id TEXT PRIMARY KEY,
                quiz_id TEXT NOT NULL,
                question_text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_option TEXT NOT NULL,
                explanation TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS quiz_results (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                quiz_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                date TEXT NOT NULL,
                payment_mode TEXT DEFAULT 'UPI',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS monthly_budgets (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                month_year TEXT NOT NULL,
                budget_amount REAL NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, month_year),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                link TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )`,
              `CREATE TABLE IF NOT EXISTS shared_resources (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                subject_name TEXT NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                file_url TEXT NOT NULL,
                file_size TEXT,
                description TEXT,
                upvotes INTEGER DEFAULT 0,
                reports_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'approved',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )`
            ];

            for (const tableSql of tables) {
              await new Promise((res, rej) => {
                sqliteDb.run(tableSql, (e) => (e ? rej(e) : res()));
              });
            }

            console.log('[Database] Tables created successfully. Seeding initial demo data...');
            await db.seedSQLite();
          }
          resolve();
        });
      });
    });
  },

  async seedSQLite() {
    try {
      const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        // Remove line comments and block comments
        const cleanSql = seedSql
          .replace(/--.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '');

        const stmts = cleanSql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const stmt of stmts) {
          if (stmt.toUpperCase().startsWith('INSERT')) {
            await new Promise((res) => {
              sqliteDb.run(stmt, (err) => {
                if (err && !err.message.includes('UNIQUE constraint')) {
                  console.warn('[Database] Seed insert notice:', err.message);
                }
                res();
              });
            });
          }
        }
        console.log('[Database] Seed data populated successfully.');
      }
    } catch (e) {
      console.warn('[Database] Seeding notice:', e.message);
    }
  }
};

module.exports = db;
