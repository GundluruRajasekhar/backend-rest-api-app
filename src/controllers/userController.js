const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/users
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const user = await User.create({ name, email, password, role });

  res.status(201).json({ success: true, data: user });
});

// GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const [users, total] = await Promise.all([
    User.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json({ success: true, data: user });
});

// PATCH /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { name, role } = req.body; // email/password intentionally not editable here
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(name !== undefined && { name }), ...(role !== undefined && { role }) },
    { new: true, runValidators: true }
  );
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json({ success: true, data: user });
});

// DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  res.status(204).send();
});

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
