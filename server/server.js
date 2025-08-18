const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jewelryRoutes = require('./routes/jewelry');
const materialRoutes = require('./routes/materials');
const categoryRoutes = require('./routes/categories');
const errorHandler = require('./middleware/errorHandler');
const inventoryRoutes = require('./routes/inventory');
const usersRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jewelry', jewelryRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', usersRoutes); 

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});