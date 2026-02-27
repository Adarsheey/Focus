const db = require('./db');

try {
    const stmt = db.prepare('INSERT INTO users (username, firebase_uid) VALUES (?, ?)');
    const info = stmt.run('testuser', 'testuid123');
    console.log("Success:", info);
} catch (e) {
    console.error("Failed to insert:", e.message);
}
