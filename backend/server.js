// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const requiredEnvVars = ['PORT', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
}

const logger = require('./config/logger');
const pinoHttp = require('pino-http')({
    logger,
    redact: ['req.headers.authorization'],
});
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(pinoHttp); // har request/response log hogi

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Notes App API is running!' });
});


// Ye line change karo:
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
// Error handler (hamesha sabse last mein)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});