const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/tasks');
const sessionRoutes = require('./routes/sessions');
const analyticsRoutes = require('./routes/analytics');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main health route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
