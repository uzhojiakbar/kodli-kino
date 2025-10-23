const sqlite3 = require("sqlite3").verbose();
const { DB_PATH } = require("../config/env");

let db = null;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("Bazaga ulanishda xatolik:", err.message);
        reject(err);
      } else {
        console.log("SQLite3 bazasi ulandi ✅");
        // Foreign key ni yoqish
        db.run("PRAGMA foreign_keys = ON", (err) => {
          if (err) {
            console.error("Foreign key yoqishda xatolik:", err.message);
            reject(err);
          } else {
            console.log("Foreign keys yoqildi ✅");
            createTables()
              .then(() => resolve(db))
              .catch(reject);
          }
        });
      }
    });
  });
};

const createTables = async () => {
  const tables = [
    // Users jadvali
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, 
      userId TEXT UNIQUE, 
      joinedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Contents jadvali - Unified kino va serial
    `CREATE TABLE IF NOT EXISTS contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code INTEGER UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('film', 'serial')),
      description TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Content items jadvali - Film uchun bitta, serial uchun ko'p qismlar
    `CREATE TABLE IF NOT EXISTS content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contentCode INTEGER NOT NULL,
      episodeNumber INTEGER DEFAULT 1,
      postId TEXT UNIQUE,
      videoHash TEXT NOT NULL,
      caption TEXT,
      count INTEGER DEFAULT 0,
      FOREIGN KEY (contentCode) REFERENCES contents(code) ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    
    // Admins jadvali
    `CREATE TABLE IF NOT EXISTS admins (
      adminId TEXT UNIQUE NOT NULL PRIMARY KEY
    )`,
    
    // MajburiyKanal jadvali
    `CREATE TABLE IF NOT EXISTS MajburiyKanal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT UNIQUE NOT NULL
    )`
  ];

  for (const table of tables) {
    await new Promise((resolve, reject) => {
      db.run(table, (err) => {
        if (err) {
          console.error("Jadval yaratishda xatolik:", err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("Ma'lumotlar bazasi ishga tushirilmagan!");
  }
  return db;
};

module.exports = {
  initDatabase,
  getDB,
};
