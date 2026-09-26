const Issue = require('../models/Issue');

// Valid image types
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
// 5MB max size for base64 string (approximately 3.75MB actual image)
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * @desc    Create a new civic issue report (with optional image as data URL)
 * @route   POST /api/issues
 * @access  Public (anonymous) or authenticated citizen
 */
const createIssue = async (req, res, next) => {
  try {
    const { category, title, location, description, priority, imageUrl, imageName } = req.body;

    // Required field validation
    if (!category || !title || !location || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, title, location, and description are required.',
      });
    }

    const validCategories = ['Roads', 'Lighting', 'Water', 'Sanitation', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 200 characters.',
      });
    }

    if (description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 2000 characters.',
      });
    }

    // Backend image validation
    let validatedImageUrl = null;
    let validatedImageName = null;

    if (imageUrl) {
      // Validate it is a data URL with an accepted MIME type
      const dataUrlMatch = imageUrl.match(/^data:(image\/\w+);base64,/);
      if (!dataUrlMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format. Must be a valid data URL.',
        });
      }

      const mimeType = dataUrlMatch[1];
      if (!VALID_IMAGE_TYPES.includes(mimeType)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported image type: ${mimeType}. Accepted: JPEG, PNG, WebP.`,
        });
      }

      // Size check: base64 string length approx encodes ~75% of original size
      if (imageUrl.length > MAX_IMAGE_SIZE_BYTES * 1.37) {
        return res.status(400).json({
          success: false,
          message: 'Image is too large. Maximum allowed size is 5MB.',
        });
      }

      validatedImageUrl = imageUrl;
      validatedImageName = imageName ? imageName.trim().substring(0, 200) : 'civic_photo.jpg';
    }

    // Generate unique ticket ID
    const ticketId = `CFX-${Math.floor(1000 + Math.random() * 9000)}`;

    // Determine ward from location
    const wardMatch = location.match(/Ward\s+\d+/i);
    const ward = wardMatch ? wardMatch[0] : 'Ward 7';

    const departmentMap = {
      Roads: 'Public Works (Road Division)',
      Lighting: 'Electrical & Grid Maintenance',
      Water: 'Municipal Water Board',
      Sanitation: 'Sanitation & Solid Waste',
      Other: 'Municipal Services',
    };

    const newIssue = await Issue.create({
      ticketId,
      ward,
      category,
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
      priority: priority || 'Medium',
      status: 'Under Review',
      imageUrl: validatedImageUrl,
      imageName: validatedImageName,
      reportedBy: req.user ? req.user.name : 'Anonymous Citizen',
      reportedByUserId: req.user ? req.user._id : null,
      department: departmentMap[category] || 'Municipal Services',
      upvotes: 1,
    });

    return res.status(201).json({
      success: true,
      message: 'Civic issue reported successfully.',
      issue: {
        id: newIssue.ticketId,
        ticketId: newIssue.ticketId,
        ward: newIssue.ward,
        category: newIssue.category,
        title: newIssue.title,
        location: newIssue.location,
        description: newIssue.description,
        priority: newIssue.priority,
        status: newIssue.status,
        imageUrl: newIssue.imageUrl,
        imageName: newIssue.imageName,
        reportedBy: newIssue.reportedBy,
        department: newIssue.department,
        upvotes: newIssue.upvotes,
        timeAgo: 'Just now',
        reportedAt: new Date().toLocaleString([], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        createdAt: newIssue.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all issues (admin only)
 * @route   GET /api/issues/admin
 * @access  Private - Admin only
 */
const getAllIssues = async (req, res, next) => {
  try {
    const { status, category, withPhoto } = req.query;

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.category = category;
    if (withPhoto === 'true') filter.imageUrl = { $ne: null };

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .limit(200);

    const formatted = issues.map((issue) => ({
      id: issue.ticketId,
      ticketId: issue.ticketId,
      ward: issue.ward,
      category: issue.category,
      title: issue.title,
      location: issue.location,
      description: issue.description,
      priority: issue.priority,
      status: issue.status,
      imageUrl: issue.imageUrl,
      imageName: issue.imageName,
      reportedBy: issue.reportedBy,
      department: issue.department,
      upvotes: issue.upvotes,
      reportedAt: issue.createdAt.toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: issue.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      issues: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update issue status (admin only)
 * @route   PATCH /api/issues/admin/:ticketId/status
 * @access  Private - Admin only
 */
const updateIssueStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Under Review', 'In Progress', 'Resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const issue = await Issue.findOne({ ticketId });
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Issue ${ticketId} not found.`,
      });
    }

    issue.status = status;
    await issue.save();

    return res.status(200).json({
      success: true,
      message: `Issue ${ticketId} status updated to "${status}".`,
      issue: {
        id: issue.ticketId,
        ticketId: issue.ticketId,
        status: issue.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent public issues (no auth required, limited fields)
 * @route   GET /api/issues/public
 * @access  Public
 */
const getPublicIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select('ticketId ward category title location status priority reportedBy department upvotes createdAt');

    const formatted = issues.map((issue) => ({
      id: issue.ticketId,
      ticketId: issue.ticketId,
      ward: issue.ward,
      category: issue.category,
      title: issue.title,
      location: issue.location,
      status: issue.status,
      priority: issue.priority,
      reportedBy: issue.reportedBy,
      department: issue.department,
      upvotes: issue.upvotes,
      timeAgo: 'Recently',
      reportedAt: issue.createdAt.toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      issues: formatted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  updateIssueStatus,
  getPublicIssues,
};
