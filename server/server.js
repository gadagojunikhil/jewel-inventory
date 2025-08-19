const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

console.log('Environment variables:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER
});

console.log('Loading routes...');
const authRoutes = require('./routes/auth');
const jewelryRoutes = require('./routes/jewelry');
const materialRoutes = require('./routes/materials');
const categoryRoutes = require('./routes/categories');
const vendorRoutes = require('./routes/vendor');
const permissionsRoutes = require('./routes/permissions');
const errorHandler = require('./middleware/errorHandler');
const inventoryRoutes = require('./routes/inventory');
const usersRoutes = require('./routes/users');
const ratesRoutes = require('./routes/rates');
console.log('Routes loaded successfully');

const app = express();

// Initialize database connection
console.log('Initializing database connection...');
require('./config/database');
console.log('Database initialized');

// Initialize rate scheduler
console.log('Initializing rate scheduler...');
const { initializeScheduler } = require('./utils/rateScheduler');
initializeScheduler();
console.log('Rate scheduler initialized');

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://192.168.1.184:3001',
    process.env.CLIENT_URL || 'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jewelry', jewelryRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/rates', ratesRoutes); 

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});