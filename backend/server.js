const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',     // Your frontend URL
  credentials: true
}));
app.use(express.json());

// Database connection
// Database connection - Add these options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-taskhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4 // Force IPv4
}).then(() => {
  console.log('MongoDB Connected Successfully');
}).catch(err => {
  console.log('MongoDB Connection Error:', err.message);
});

// Debug all incoming requests
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(`   Headers:`, req.headers);
  if (req.method === 'POST') {
    console.log(`   Body:`, req.body);
  }
  next();
});


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/projects', require('./routes/projects'));

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-project', (projectId) => {
    socket.join(projectId);
  });
  
  socket.on('task-updated', (data) => {
    socket.to(data.projectId).emit('task-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

const PORT = process.env.PORT || 5030;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});