const db = require('./db');

console.log("--- USERS ---");
const users = db.prepare('SELECT * FROM users').all();
console.log(users);

console.log("--- TASKS ---");
const tasks = db.prepare('SELECT id, user_id, title FROM tasks').all();
console.log(tasks);

console.log("--- SESSIONS ---");
const sessions = db.prepare('SELECT id, user_id, task_id FROM sessions').all();
console.log(sessions);
