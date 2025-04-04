const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRouter = require('./routes/userRoutes');
const paymentRouter = require('./routes/paymentRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-signature']
}));

// Raw body parser for webhook route ONLY
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// Store raw body for verification
app.use((req, res, next) => {
    if (req.originalUrl === '/api/v1/payments/webhook') {
        req.rawBody = req.body;
    }
    next();
});

// Regular body parser for all other routes
app.use(express.json({ 
    limit: '10kb',
    verify: (req, res, buf) => {
        if (req.originalUrl !== '/api/v1/payments/webhook') {
            req.rawBody = buf;
        }
    }
}));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB successfully");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
});

// Error handler for MongoDB connection
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Add request logging middleware for debugging
app.use((req, res, next) => {
    if (req.originalUrl === '/api/v1/payments/webhook') {
        console.log('Webhook Request Headers:', req.headers);
        console.log('Webhook Raw Body:', req.rawBody?.toString());
    }
    next();
});

// Routes
app.use('/api/v1', userRouter);
app.use('/api/v1/payments', paymentRouter);

// Root route
app.get('/', (req, res) => {
    res.send('Hello world!');
});

// Error handling for undefined routes
app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log webhook-related errors with more detail
    if (req.originalUrl === '/api/v1/payments/webhook') {
        console.error('Webhook Error:', {
            error: err,
            headers: req.headers,
            body: req.rawBody?.toString()
        });
    }

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});