/**
 * SQLite Database Adapter
 * For mobile applications using Capacitor SQLite
 */

import { DatabaseService, QueryResult, DatabaseConfig } from './DatabaseService';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export class SQLiteAdapter extends DatabaseService {
  private sqlite: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;

  constructor(config: DatabaseConfig) {
    super(config);
  }

  async initialize(): Promise<void> {
    try {
      console.log('🗄️ Initializing SQLite database...');
      
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        throw new Error('SQLite is only available on native platforms');
      }

      // Check if SQLite plugin is available
      if (!CapacitorSQLite) {
        throw new Error('SQLite plugin not available');
      }

      this.sqlite = new SQLiteConnection(CapacitorSQLite);
      
      console.log('🗄️ Creating database connection...');
      
      // Create or open database with better error handling
      this.db = await this.sqlite.createConnection(
        this.config.name,
        false, // not encrypted (we'll encrypt data at app level)
        'no-encryption',
        this.config.version,
        false
      );

      console.log('🗄️ Opening database...');
      await this.db.open();
      
      console.log('🗄️ Running migrations...');
      // Run migrations
      await this.runMigrations();
      
      this.isInitialized = true;
      console.log('✅ SQLite database initialized successfully');
    } catch (error) {
      console.error('❌ SQLite initialization error:', error);
      throw new Error(`Failed to initialize SQLite database: ${error.message}`);
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const migrations = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        role TEXT CHECK(role IN ('teacher', 'admin', 'principal')) DEFAULT 'teacher',
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Schools table
      `CREATE TABLE IF NOT EXISTS schools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Classes table
      `CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        school_id TEXT,
        teacher_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Students table
      `CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        roll_number TEXT,
        email TEXT,
        phone TEXT,
        parent_phone TEXT,
        address TEXT,
        photo_url TEXT,
        class_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      )`,

      // Sessions table
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        class_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        subtopic TEXT,
        date DATETIME NOT NULL,
        exam_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      )`,

      // Attendance table
      `CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        present BOOLEAN NOT NULL DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(session_id, student_id)
      )`,

      // Exams table
      `CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        class_id TEXT NOT NULL,
        date DATETIME NOT NULL,
        max_score INTEGER NOT NULL DEFAULT 100,
        pdf_url TEXT,
        pdf_filename TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      )`,

      // Exam results table
      `CREATE TABLE IF NOT EXISTS exam_results (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        score REAL NOT NULL,
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(exam_id, student_id)
      )`,

      // Assignments table
      `CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        class_id TEXT NOT NULL,
        due_date DATETIME NOT NULL,
        max_points INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      )`,

      // Assignment submissions table
      `CREATE TABLE IF NOT EXISTS assignment_submissions (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        submitted BOOLEAN DEFAULT 0,
        submitted_at DATETIME,
        grade REAL,
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE(assignment_id, student_id)
      )`,

      // Indexes for performance
      'CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_class ON sessions(class_id)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id)',
      'CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_exams_class ON exams(class_id)',
      'CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id)',
      'CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id)',
      'CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id)',
    ];

    // Execute all migrations
    for (const migration of migrations) {
      await this.db.execute(migration);
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.query(sql, params || []);
      return {
        rows: (result.values || []) as T[],
        rowsAffected: result.changes?.changes || 0,
      };
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  async transaction(queries: Array<{ sql: string; params?: any[] }>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.execute('BEGIN TRANSACTION');
      
      for (const { sql, params } of queries) {
        await this.db.run(sql, params || []);
      }
      
      await this.db.execute('COMMIT');
    } catch (error) {
      await this.db.execute('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    }
  }

  async insert<T = any>(table: string, data: Partial<T>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = (data as any).id || this.generateId();
    const dataWithId = { ...data, id };
    
    const fields = Object.keys(dataWithId);
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map((field) => (dataWithId as any)[field]);

    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
    
    await this.db.run(sql, values);
    return id;
  }

  async update<T = any>(table: string, data: Partial<T>, where: string, params?: any[]): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = Object.keys(data);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = [...fields.map((field) => (data as any)[field]), ...(params || [])];

    const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE ${where}`;
    
    const result = await this.db.run(sql, values);
    return result.changes?.changes || 0;
  }

  async delete(table: string, where: string, params?: any[]): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const result = await this.db.run(sql, params || []);
    return result.changes?.changes || 0;
  }

  async select<T = any>(table: string, where?: string, params?: any[]): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sql = `SELECT * FROM ${table}`;
    if (where) {
      sql += ` WHERE ${where}`;
    }

    const result = await this.query<T>(sql, params);
    return result.rows;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
    if (this.sqlite) {
      await this.sqlite.closeConnection(this.config.name, false);
      this.sqlite = null;
    }
    this.isInitialized = false;
  }

  async clear(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      'assignment_submissions',
      'assignments',
      'exam_results',
      'exams',
      'attendance',
      'sessions',
      'students',
      'classes',
      'schools',
      'users',
    ];

    for (const table of tables) {
      await this.db.execute(`DELETE FROM ${table}`);
    }
  }

  async exportData(): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    const data: any = {};
    const tables = ['users', 'schools', 'classes', 'students', 'sessions', 'attendance', 'exams', 'exam_results', 'assignments', 'assignment_submissions'];

    for (const table of tables) {
      const result = await this.select(table);
      data[table] = result;
    }

    return data;
  }

  async importData(data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.clear();

    const tables = Object.keys(data);
    for (const table of tables) {
      const records = data[table];
      for (const record of records) {
        await this.insert(table, record);
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
