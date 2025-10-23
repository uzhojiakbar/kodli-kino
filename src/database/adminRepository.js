const { getDB } = require("./init");

// Admin CRUD
const isAdmin = (userId) => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.get(
      `SELECT * FROM admins WHERE adminId = ?`,
      [String(userId)],
      (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      }
    );
  });
};

const getAllAdmins = () => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.all(`SELECT * FROM admins`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const addAdmin = (adminId) => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.run(
      `INSERT INTO admins (adminId) VALUES (?)`,
      [String(adminId)],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const deleteAdmin = (adminId) => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.run(
      `DELETE FROM admins WHERE adminId = ?`,
      [String(adminId)],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
};

const getAdmin = (adminId) => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.get(
      `SELECT * FROM admins WHERE adminId = ?`,
      [String(adminId)],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

module.exports = {
  isAdmin,
  getAllAdmins,
  addAdmin,
  deleteAdmin,
  getAdmin,
};
