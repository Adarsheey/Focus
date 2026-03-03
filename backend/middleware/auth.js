const admin = require('../firebase-admin');
const pool = require('../db');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email } = decodedToken;

        // Check if user exists
        let result = await pool.query(
            'SELECT * FROM users WHERE firebase_uid = $1',
            [uid]
        );

        let user = result.rows[0];

        if (!user) {
            // Insert new user
            const insertResult = await pool.query(
                'INSERT INTO users (username, firebase_uid) VALUES ($1, $2) RETURNING *',
                [email || uid, uid]
            );

            user = insertResult.rows[0];
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