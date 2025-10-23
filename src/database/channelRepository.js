const { getDB } = require("./init");

// Channel CRUD
const getAllChannels = () => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.all(`SELECT * FROM MajburiyKanal`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const addChannel = (username, name) => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.run(
      `INSERT INTO MajburiyKanal (username, name) VALUES (?, ?)`,
      [String(username), String(name)],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const deleteChannel = (username) => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.run(
      `DELETE FROM MajburiyKanal WHERE username = ?`,
      [username],
      function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
};

const getChannel = (username) => {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.get(
      `SELECT * FROM MajburiyKanal WHERE username = ?`,
      [username],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

module.exports = {
  getAllChannels,
  addChannel,
  deleteChannel,
  getChannel,
};
