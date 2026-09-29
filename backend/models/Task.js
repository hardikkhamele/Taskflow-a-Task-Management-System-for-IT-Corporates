const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, 'Please specify a project name'],
      trim: true,
    },
    taskName: {
      type: String,
      required: [true, 'Please specify a task name'],
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must be assigned to a user'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task assigner must be specified'],
    },
    status: {
      type: String,
      enum: ['Pending', 'On Going', 'Completed'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    issueDate: {
      type: Date,
      required: [true, 'Please set an issue date'],
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please set a due date'],
      validate: {
        validator: function (value) {
          return !this.issueDate || value >= this.issueDate;
        },
        message: 'Due date cannot be prior to issue date',
      },
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual index for searching
taskSchema.index({ projectName: 'text', taskName: 'text' });

module.exports = mongoose.model('Task', taskSchema);
