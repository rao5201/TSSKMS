/**
 * sqlite3 compatibility shim using sql.js (WebAssembly SQLite)
 * - Provides async-style callbacks matching the sqlite3 API
 * - Persists database to disk automatically after writes
 * - Works with any Node.js version (no native compilation needed)
 */
'use strict';

const fs = require('fs');
const path = require('path');

let _SQL = null;

// Lazily initialize sql.js
async function getSQL() {
  if (!_SQL) {
    const initSqlJs = require('sql.js');
    _SQL = await initSqlJs();
  }
  return _SQL;
}

class Database {
  constructor(dbPath) {
    this._path = dbPath;
    this._db = null;
    this._saveTimer = null;
    this._initDone = false;
    this._queue = []; // queue of operations waiting for init
    this._initError = null;

    // Load database synchronously via a hack:
    // sql.js init is async but we need sync constructor.
    // We use a queue-drain approach.
    this._initPromise = getSQL().then(SQL => {
      if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        this._db = new SQL.Database(fileBuffer);
      } else {
        this._db = new SQL.Database();
      }
      this._initDone = true;
      this._drainQueue();
    }).catch(err => {
      this._initError = err;
      console.error('[sqlite3-compat] Init error:', err.message);
      this._drainQueue();
    });
  }

  _drainQueue() {
    const q = this._queue.splice(0);
    q.forEach(fn => fn());
  }

  _whenReady(fn) {
    if (this._initDone || this._initError) {
      fn();
    } else {
      this._queue.push(fn);
    }
  }

  // Persist to file (debounced)
  _scheduleSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      if (!this._db) return;
      try {
        const data = this._db.export();
        const buf = Buffer.from(data);
        fs.writeFileSync(this._path, buf);
      } catch (e) {
        console.error('[sqlite3-compat] Save error:', e.message);
      }
    }, 100);
  }

  // Immediate save (for critical writes)
  _saveNow() {
    if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
    if (!this._db) return;
    try {
      const data = this._db.export();
      fs.writeFileSync(this._path, Buffer.from(data));
    } catch (e) {
      console.error('[sqlite3-compat] SaveNow error:', e.message);
    }
  }

  // Parse sql.js results into row objects
  _parseResults(results) {
    if (!results || results.length === 0) return [];
    const { columns, values } = results[0];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  }

  // Prepare statement with named/positional params
  _prepareAndRun(sql, params) {
    // sql.js uses ? for positional, :name for named
    const stmt = this._db.prepare(sql);
    stmt.run(params || []);
    const lastID = this._db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] || 0;
    const changes = this._db.getRowsModified();
    stmt.free();
    return { lastID, changes };
  }

  run(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    params = params || [];
    this._whenReady(() => {
      if (this._initError) {
        if (callback) callback.call({}, this._initError);
        return;
      }
      try {
        const stmt = this._db.prepare(sql);
        stmt.run(params);
        stmt.free();
        const lastID = this._db.exec('SELECT last_insert_rowid()')[0]?.values[0][0] || 0;
        const changes = this._db.getRowsModified();
        this._scheduleSave();
        const ctx = { lastID, changes };
        if (callback) callback.call(ctx, null);
      } catch (err) {
        // DDL "already exists" is fine (schema init), but DML errors (INSERT/UPDATE/DELETE) must propagate
        const isDDL = /^\s*(CREATE|DROP|ALTER)\s/i.test(sql);
        if (!isDDL || !err.message.includes('already exists')) {
          console.error('[sqlite3-compat] run error:', err.message, '\nSQL:', sql.substring(0,100));
        }
        if (callback) {
          if (isDDL && err.message.includes('already exists')) {
            callback.call({}, null); // swallow DDL already-exists
          } else {
            callback.call({}, err); // propagate real errors (UNIQUE, FK, etc.)
          }
        }
      }
    });
    return this;
  }

  get(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    params = params || [];
    this._whenReady(() => {
      if (this._initError) {
        if (callback) callback(this._initError);
        return;
      }
      try {
        const stmt = this._db.prepare(sql);
        stmt.bind(params);
        let row = undefined;
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          row = {};
          cols.forEach((c, i) => { row[c] = vals[i]; });
        }
        stmt.free();
        if (callback) callback(null, row);
      } catch (err) {
        console.error('[sqlite3-compat] get error:', err.message, '\nSQL:', sql.substring(0,100));
        if (callback) callback(err);
      }
    });
    return this;
  }

  all(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    params = params || [];
    this._whenReady(() => {
      if (this._initError) {
        if (callback) callback(this._initError, []);
        return;
      }
      try {
        const stmt = this._db.prepare(sql);
        stmt.bind(params);
        const cols = stmt.getColumnNames();
        const rows = [];
        while (stmt.step()) {
          const vals = stmt.get();
          const obj = {};
          cols.forEach((c, i) => { obj[c] = vals[i]; });
          rows.push(obj);
        }
        stmt.free();
        if (callback) callback(null, rows);
      } catch (err) {
        console.error('[sqlite3-compat] all error:', err.message, '\nSQL:', sql.substring(0,100));
        if (callback) callback(err, []);
      }
    });
    return this;
  }

  each(sql, params, callback, complete) {
    if (typeof params === 'function') {
      complete = callback;
      callback = params;
      params = [];
    }
    params = params || [];
    this._whenReady(() => {
      try {
        const stmt = this._db.prepare(sql);
        stmt.bind(params);
        const cols = stmt.getColumnNames();
        let count = 0;
        while (stmt.step()) {
          const vals = stmt.get();
          const obj = {};
          cols.forEach((c, i) => { obj[c] = vals[i]; });
          if (callback) callback(null, obj);
          count++;
        }
        stmt.free();
        if (complete) complete(null, count);
      } catch (err) {
        if (callback) callback(err);
      }
    });
    return this;
  }

  serialize(callback) {
    if (callback) {
      this._whenReady(callback);
    }
    return this;
  }

  parallelize(callback) {
    return this.serialize(callback);
  }

  close(callback) {
    this._whenReady(() => {
      try {
        this._saveNow();
        if (this._db) this._db.close();
        if (callback) callback(null);
      } catch (err) {
        if (callback) callback(err);
      }
    });
  }
}

module.exports = {
  verbose() { return this; },
  Database,
};
