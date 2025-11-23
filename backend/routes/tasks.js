const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const { calculateAIPriority } = require('../utils/aiPriority');

const router = express.Router();

// Get all tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      project: req.params.projectId 
    })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ aiPriorityScore: -1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    console.log('📥 Received task creation request:', req.body);
    console.log('👤 User ID:', req.user.id);

    const { title, description, priority, dueDate, estimatedHours, project } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    if (!project) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    // Check if project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member of the project
    const isMember = projectDoc.members.some(
      member => member.user.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
    }

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      estimatedHours: estimatedHours || 0,
      project: project,
      createdBy: req.user.id,
      assignedTo: [req.user.id], // Assign to current user by default
      status: 'todo'
    });

    console.log('✅ Task created successfully:', task._id);

    // Populate the task
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');

    // Emit real-time update
    if (req.app.get('io')) {
  req.app.get('io').to(req.body.project).emit('task-update', {
    type: 'created',
    task: populatedTask
  });
}

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('❌ Task creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Recalculate AI priority if relevant fields changed
    const priorityFields = ['title', 'description', 'dueDate', 'priority', 'estimatedHours'];
    const needsRecalculation = priorityFields.some(field => 
      req.body[field] !== undefined && req.body[field] !== task[field]
    );

    if (needsRecalculation) {
      req.body.aiPriorityScore = await calculateAIPriority({
        ...task.toObject(),
        ...req.body
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email');

    // Emit real-time update
    if (req.app.get('io')) {
  req.app.get('io').to(task.project.toString()).emit('task-update', {
    type: 'updated',
    task: updatedTask
  });
}
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(
      member => member.user.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Emit real-time update
    if (req.app.get('io')) {
  req.app.get('io').to(task.project.toString()).emit('task-update', {
    type: 'deleted',
    taskId: req.params.id
  });
}

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's tasks with AI-prioritized order
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user.id,
      status: { $ne: 'completed' }
    })
    .populate('project', 'name color')
    .populate('createdBy', 'name')
    .sort({ aiPriorityScore: -1, dueDate: 1 })
    .limit(1000); // Handle large datasets efficiently

    res.json(tasks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;