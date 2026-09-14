const { Router } = require('express');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
