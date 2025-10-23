const { getDB } = require("./init");

// Users CRUD
const addUser = (userId) => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.get(
      `SELECT * FROM users WHERE userId = ?`,
      [String(userId)],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (!row) {
          db.run(
            `INSERT INTO users (userId, joinedAt) VALUES (?, CURRENT_TIMESTAMP)`,
            [String(userId)],
            (err) => {
              if (err) {
                reject(err);
              } else {
                console.log("Foydalanuvchi muvaffaqiyatli qo'shildi.");
                resolve(true);
              }
            }
          );
        } else {
          // Allaqachon mavjud - log chiqarmaslik
          resolve(false);
        }
      }
    );
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.all(`SELECT * FROM users`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const countUsers = (timeFilter = null) => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    let query = `SELECT COUNT(*) AS count FROM users`;
    const params = [];

    if (timeFilter) {
      query += ` WHERE joinedAt >= ?`;
      params.push(timeFilter);
    }

    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
};

module.exports = {
  addUser,
  getAllUsers,
  countUsers,
};
