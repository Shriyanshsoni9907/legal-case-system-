const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/appError');

const app = express();

// Ensure uploads directory exists for document storage
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created successfully.');
}

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static route to serve uploaded documents
app.use('/uploads', express.static(uploadsDir));

// Routes
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const caseRoutes = require('./routes/caseRoutes');
const documentRoutes = require('./routes/documentRoutes');
const hearingRoutes = require('./routes/hearingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsController = require('./controllers/analyticsController');
const { protect } = require('./middleware/authMiddleware');

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/cases/:caseId/documents', documentRoutes);
app.use('/api/hearings', hearingRoutes);
app.use('/api/chat', chatRoutes);
app.get('/api/analytics/dashboard', protect, analyticsController.getDashboardStats);
app.get('/api/search', protect, analyticsController.globalSearch);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Legal Case Management API is healthy.',
    mode: db.getIsMock() ? 'in-memory' : 'postgresql',
    timestamp: new Date(),
  });
});

// Serve static assets in production mode
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Route catch-all for 404s
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});

module.exports = server;
