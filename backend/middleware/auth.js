const admin = require('../firebase-admin');
const db = require('../db');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email } = decodedToken;

        // Check if user exists in local DB
        let user = db.prepare('SELECT * FROM users WHERE firebase_uid = ?').get(uid);

        if (!user) {
            // Create user if they don't exist
            const stmt = db.prepare('INSERT INTO users (username, firebase_uid) VALUES (?, ?)');
            const info = stmt.run(email || uid, uid);
            user = { id: info.lastInsertRowid, firebase_uid: uid, username: email || uid };
        }

        req.user_id = user.id;
        req.firebase_uid = uid;
        next();
    } catch (error) {
        console.error('Error verifying Firebase token:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;
