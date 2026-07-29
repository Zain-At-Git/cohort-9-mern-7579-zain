// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const logger = require('./config/logger');
const pinoHttp = require('pino-http')({ logger });
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
// Error handler (hamesha sabse last mein)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});