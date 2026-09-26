const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ward: {
      type: String,
      trim: true,
      default: 'Ward 7',
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ['Roads', 'Lighting', 'Water', 'Sanitation', 'Other'],
        message: '{VALUE} is not a valid category',
      },
    },
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [300, 'Location cannot exceed 300 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Under Review', 'In Progress', 'Resolved'],
      default: 'Under Review',
    },
    // Image stored as base64 data URL for self-contained demo (no external storage)
    imageUrl: {
      type: String,
      default: null,
    },
    imageName: {
      type: String,
      default: null,
    },
    reportedBy: {
      type: String,
      default: 'Anonymous Citizen',
    },
    reportedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    upvotes: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
