const { getDB } = require("./init");

// ==================== CONTENT CRUD ====================

// Code mavjudligini tekshirish (film yoki serial)
const checkCodeExists = (code) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM contents WHERE code = ?",
      [code],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

// Yangi content yaratish (film yoki serial)
const createContent = (code, type, description = null) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO contents (code, type, description) VALUES (?, ?, ?)",
      [code, type, description],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, code, type, description });
      }
    );
  });
};

// Content ma'lumotlarini olish
const getContentByCode = (code) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM contents WHERE code = ?",
      [code],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

// Content code ni o'zgartirish
const updateContentCode = (oldCode, newCode) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE contents SET code = ? WHERE code = ?",
      [newCode, oldCode],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
};

// Content description ni yangilash
const updateContentDescription = (code, description) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE contents SET description = ? WHERE code = ?",
      [description, code],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
};

// Content o'chirish (cascade bilan itemlar ham o'chadi)
const deleteContent = (code) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM contents WHERE code = ?",
      [code],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
};

// Barcha contentlarni olish
const getAllContents = () => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM contents ORDER BY createdAt DESC", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Type bo'yicha contentlarni olish
const getContentsByType = (type) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM contents WHERE type = ? ORDER BY createdAt DESC",
      [type],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

// ==================== CONTENT ITEMS CRUD ====================

// Content item qo'shish (film uchun 1 ta, serial uchun ko'p ta)
const addContentItem = (contentCode, episodeNumber, postId, videoHash, caption = null) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO content_items (contentCode, episodeNumber, postId, videoHash, caption) VALUES (?, ?, ?, ?, ?)",
      [contentCode, episodeNumber, postId, videoHash, caption],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, contentCode, episodeNumber });
      }
    );
  });
};

// Content itemlarini olish
const getContentItems = (contentCode) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM content_items WHERE contentCode = ? ORDER BY episodeNumber ASC",
      [contentCode],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

// Bitta item olish
const getContentItemById = (itemId) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM content_items WHERE id = ?",
      [itemId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

// Item count ni oshirish
const incrementItemCount = (itemId) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE content_items SET count = count + 1 WHERE id = ?",
      [itemId],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
};

// Content itemlarini o'chirish
const deleteContentItem = (itemId) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM content_items WHERE id = ?",
      [itemId],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
};

// Content itemlarining sonini olish
const getContentItemsCount = (contentCode) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) as count FROM content_items WHERE contentCode = ?",
      [contentCode],
      (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      }
    );
  });
};

// Bitta qismni o'chirish (episode number orqali)
const deleteContentItemByEpisode = (contentCode, episodeNumber) => {
  const db = getDB();
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM content_items WHERE contentCode = ? AND episodeNumber = ?",
      [contentCode, episodeNumber],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
};

module.exports = {
  // Content methods
  checkCodeExists,
  createContent,
  getContentByCode,
  updateContentCode,
  updateContentDescription,
  deleteContent,
  getAllContents,
  getContentsByType,
  
  // Content items methods
  addContentItem,
  getContentItems,
  getContentItemById,
  incrementItemCount,
  deleteContentItem,
  getContentItemsCount,
  deleteContentItemByEpisode,
};
