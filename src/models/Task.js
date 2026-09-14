const mongoose = require('mongoose');

const TASK_STATUSES = ['todo', 'in-progress', 'done'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'todo',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1 });

taskSchema.statics.STATUSES = TASK_STATUSES;

module.exports = mongoose.model('Task', taskSchema);
