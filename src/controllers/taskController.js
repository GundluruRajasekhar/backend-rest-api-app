const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, assignee, status, dueDate } = req.body;

  const projectExists = await Project.exists({ _id: project });
  if (!projectExists) throw ApiError.badRequest('project must reference an existing project');

  if (assignee) {
    const assigneeExists = await User.exists({ _id: assignee });
    if (!assigneeExists) throw ApiError.badRequest('assignee must reference an existing user');
  }

  const task = await Task.create({ title, description, project, assignee, status, dueDate });

  res.status(201).json({ success: true, data: task });
});

// GET /api/tasks
const getTasks = asyncHandler(async (req, res) => {
  const { project, assignee, status } = req.query;
  const filter = {
    ...(project && { project }),
    ...(assignee && { assignee }),
    ...(status && { status }),
  };

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: tasks,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/tasks/:id
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('project', 'name')
    .populate('assignee', 'name email');
  if (!task) throw ApiError.notFound('Task not found');
  res.status(200).json({ success: true, data: task });
});

// PATCH /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, assignee, dueDate } = req.body;
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(assignee !== undefined && { assignee }),
      ...(dueDate !== undefined && { dueDate }),
    },
    { new: true, runValidators: true }
  );
  if (!task) throw ApiError.notFound('Task not found');
  res.status(200).json({ success: true, data: task });
});

// PATCH /api/tasks/:id/status — dedicated endpoint for status transitions
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!task) throw ApiError.notFound('Task not found');
  res.status(200).json({ success: true, data: task });
});

// DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  res.status(204).send();
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
