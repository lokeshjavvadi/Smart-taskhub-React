const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Test route - GET
router.get('/test', (req, res) => {
  console.log('✅ GET /api/projects/test route hit!');
  res.json({ 
    message: 'Projects GET route is working!',
    timestamp: new Date().toISOString()
  });
});

// Test POST route - to verify POST works
router.post('/test-post', (req, res) => {
  console.log('✅ POST /api/projects/test-post route hit!');
  console.log('📦 Request body:', req.body);
  res.json({ 
    message: 'Projects POST route is working!',
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// CREATE PROJECT - POST route
router.post('/', auth, async (req, res) => {
  try {
    console.log('🎯 POST /api/projects route hit!');
    console.log('📥 Request body:', req.body);
    console.log('👤 Authenticated user:', req.user.id);

    const { name, description, color } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    // Create project
    const project = await Project.create({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#3B82F6',
      createdBy: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin'
      }]
    });

    console.log('✅ Project created successfully:', project._id);

    // Return the created project
    res.status(201).json({
      _id: project._id,
      name: project.name,
      description: project.description,
      color: project.color,
      createdBy: project.createdBy,
      members: project.members,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    });

  } catch (error) {
    console.error('❌ Project creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all projects (for testing) - GET
router.get('/', (req, res) => {
  console.log('✅ GET /api/projects route hit!');
  res.json({ 
    message: 'Projects API is working!',
    availableEndpoints: [
      'GET /api/projects/test',
      'POST /api/projects/test-post',
      'POST /api/projects',
      'GET /api/projects/my-projects'
    ],
    timestamp: new Date().toISOString()
  });
});

// Get user's projects - GET
router.get('/my-projects', auth, async (req, res) => {
  try {
    console.log('✅ GET /api/projects/my-projects route hit!');
    const projects = await Project.find({
      'members.user': req.user.id
    }).sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;



/* const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color: color || '#3B82F6',
      createdBy: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin'
      }]
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email avatar');

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's projects
router.get('/my-projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user.id
    })
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;*/