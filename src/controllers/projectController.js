const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { name, description, owner, status } = req.body;

  const ownerExists = await User.exists({ _id: owner });
  if (!ownerExists) throw ApiError.badRequest('owner must reference an existing user');

  const project = await Project.create({ name, description, owner, status });

  res.status(201).json({ success: true, data: project });
});

// GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const { owner, status } = req.query;
  const filter = {
    ...(owner && { owner }),
    ...(status && { status }),
  };

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('owner', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Project.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: projects,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('owner', 'name email');
  if (!project) throw ApiError.notFound('Project not found');
  res.status(200).json({ success: true, data: project });
});

// PATCH /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
    },
    { new: true, runValidators: true }
  );
  if (!project) throw ApiError.notFound('Project not found');
  res.status(200).json({ success: true, data: project });
});

// DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  // Keep task data consistent — remove tasks that belonged to this project
  await Task.deleteMany({ project: project._id });

  res.status(204).send();
});

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };
