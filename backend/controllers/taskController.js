const Task = require('../models/Task');
const mongoose = require('mongoose');

const checkDbReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database server offline' });
    return false;
  }
  return true;
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin & Manager only)
const createTask = async (req, res, next) => {
  try {
    if (!checkDbReady(res)) return;
    const {
      projectName,
      taskName,
      assignedTo,
      status,
      priority,
      issueDate,
      dueDate,
      description,
    } = req.body;

    // Validate due date >= issue date
    if (issueDate && dueDate && new Date(dueDate) < new Date(issueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Due Date cannot be prior to Issue Date',
      });
    }

    const task = await Task.create({
      projectName,
      taskName,
      assignedTo,
      assignedBy: req.user._id,
      status: status || 'Pending',
      priority: priority || 'Medium',
      issueDate: issueDate || new Date(),
      dueDate,
      description,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filtering, search, sorting & pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    if (!checkDbReady(res)) return;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Role restriction: Employees only view tasks assigned to them (or created by them)
    if (req.user.role === 'Employee') {
      query.$or = [{ assignedTo: req.user._id }];
    }

    // Search by Project Name or Task Name
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { projectName: searchRegex },
        { taskName: searchRegex },
      ];
      // Keep employee scoping if applicable
      if (req.user.role === 'Employee') {
        query.assignedTo = req.user._id;
      }
    }

    // Filter by Status
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    // Filter by Priority
    if (req.query.priority && req.query.priority !== 'All') {
      query.priority = req.query.priority;
    }

    // Filter by Assigned User
    if (req.query.assignedTo && req.query.assignedTo !== 'All') {
      query.assignedTo = req.query.assignedTo;
    }

    // Sorting
    let sort = {};
    const sortBy = req.query.sortBy || 'Newest';
    if (sortBy === 'Newest') sort = { createdAt: -1 };
    else if (sortBy === 'Oldest') sort = { createdAt: 1 };
    else if (sortBy === 'Due Date') sort = { dueDate: 1 };
    else if (sortBy === 'Priority') {
      // Custom priority order logic handled or sorted by dueDate fallback
      sort = { priority: 1, dueDate: 1 };
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: tasks.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/tasks/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    if (!checkDbReady(res)) return;
    const scopeQuery = req.user.role === 'Employee' ? { assignedTo: req.user._id } : {};

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      onGoingTasks,
      overdueTasks,
      highPriorityTasks,
      todayTasks,
      weekTasks,
      recentTasks,
    ] = await Promise.all([
      Task.countDocuments(scopeQuery),
      Task.countDocuments({ ...scopeQuery, status: 'Completed' }),
      Task.countDocuments({ ...scopeQuery, status: 'Pending' }),
      Task.countDocuments({ ...scopeQuery, status: 'On Going' }),
      Task.countDocuments({
        ...scopeQuery,
        status: { $ne: 'Completed' },
        dueDate: { $lt: now },
      }),
      Task.countDocuments({
        ...scopeQuery,
        priority: { $in: ['High', 'Critical'] },
      }),
      Task.countDocuments({
        ...scopeQuery,
        dueDate: { $gte: startOfToday, $lte: endOfToday },
      }),
      Task.countDocuments({
        ...scopeQuery,
        dueDate: { $gte: startOfWeek, $lte: endOfWeek },
      }),
      Task.find(scopeQuery)
        .populate('assignedTo', 'name email role')
        .populate('assignedBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        onGoingTasks,
        overdueTasks,
        highPriorityTasks,
        todayTasks,
        weekTasks,
        recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Role check: Employee can only view assigned task
    if (req.user.role === 'Employee' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this task' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Authorization checks
    if (req.user.role === 'Employee') {
      // Employees can only update their own task's status
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      }

      // Allow status update only for Employee
      if (req.body.status) {
        task.status = req.body.status;
      }
      await task.save();

      const updated = await Task.findById(task._id)
        .populate('assignedTo', 'name email role')
        .populate('assignedBy', 'name email role');

      return res.json({
        success: true,
        message: 'Task status updated successfully',
        data: updated,
      });
    }

    // Admin & Manager full update
    const {
      projectName,
      taskName,
      assignedTo,
      status,
      priority,
      issueDate,
      dueDate,
      description,
    } = req.body;

    if (issueDate && dueDate && new Date(dueDate) < new Date(issueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Due Date cannot be prior to Issue Date',
      });
    }

    task.projectName = projectName || task.projectName;
    task.taskName = taskName || task.taskName;
    task.assignedTo = assignedTo || task.assignedTo;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    if (issueDate) task.issueDate = issueDate;
    if (dueDate) task.dueDate = dueDate;
    if (description !== undefined) task.description = description;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin & Manager only)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getDashboardStats,
  getTaskById,
  updateTask,
  deleteTask,
};
