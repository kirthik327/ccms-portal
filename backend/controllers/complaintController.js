const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Student only)
exports.createComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can submit complaints' });
    }

    const { title, description, category, department, location, priority } = req.body;

    if (!title || !description || !category || !department || !location || !priority) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    let imageUrl = '';
    let imagePublicId = '';

    // Handle image upload
    if (req.file) {
      if (isConfigured) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'ccms_complaints',
          });
          imageUrl = result.secure_url;
          imagePublicId = result.public_id;
          // Delete file from local server storage
          fs.unlinkSync(req.file.path);
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          // Fallback to local server path if Cloudinary fails
          imageUrl = `/uploads/${req.file.filename}`;
        }
      } else {
        // Use local file path
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      department,
      location,
      priority,
      studentId: req.user.id,
      imageUrl,
      imagePublicId,
      history: [
        {
          status: 'Submitted',
          updatedBy: req.user.id,
          note: 'Complaint submitted by student.',
        },
      ],
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all complaints (filtered, searched, paginated)
// @route   GET /api/complaints
// @access  Private (Student & Admin)
exports.getComplaints = async (req, res) => {
  try {
    const { category, department, status, priority, search, page = 1, limit = 10, startDate, endDate } = req.query;

    const query = {};

    // 1. Role-based constraints
    if (req.user.role === 'student') {
      // Students can only see their own complaints
      query.studentId = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admins see complaints assigned to them, OR unassigned complaints, OR all (super admin sees all)
      // So if not superadmin:
      query.$or = [{ assignedTo: req.user.name }, { assignedTo: '' }, { assignedTo: null }];
    }
    // Superadmin doesn't have restrictions (query contains all)

    // 2. Apply Filters
    if (category) query.category = category;
    if (department) query.department = department;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Search query (matches title or description)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // 3. Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('studentId', 'name email department rollNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: complaints.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single complaint details
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email department rollNumber year')
      .populate('replies.senderId', 'name email role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Enforce privacy rule
    if (req.user.role === 'student' && complaint.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    if (
      req.user.role === 'admin' &&
      complaint.assignedTo &&
      complaint.assignedTo !== req.user.name &&
      req.user.role !== 'superadmin'
    ) {
      // It is assigned to another admin and this is not superadmin
      return res.status(403).json({ success: false, message: 'Not authorized to view complaints assigned to other admins' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit complaint (Student only, before review)
// @route   PUT /api/complaints/:id
// @access  Private
exports.updateComplaint = async (req, res) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Authorize student ownership
    if (complaint.studentId.toString() !== req.user.id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Not authorized to update this complaint' });
    }

    // Check if complaint has already been reviewed
    if (complaint.status !== 'Submitted') {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Cannot edit complaint once review or action has started.',
      });
    }

    const { title, description, category, department, location, priority } = req.body;

    const updatedData = {
      title: title || complaint.title,
      description: description || complaint.description,
      category: category || complaint.category,
      department: department || complaint.department,
      location: location || complaint.location,
      priority: priority || complaint.priority,
    };

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (complaint.imagePublicId && isConfigured) {
        await cloudinary.uploader.destroy(complaint.imagePublicId);
      } else if (complaint.imageUrl && !complaint.imagePublicId) {
        // Delete local file if it exists
        const localPath = path.join(__dirname, '..', complaint.imageUrl);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }

      if (isConfigured) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'ccms_complaints',
          });
          updatedData.imageUrl = result.secure_url;
          updatedData.imagePublicId = result.public_id;
          fs.unlinkSync(req.file.path);
        } catch (uploadError) {
          console.error(uploadError);
          updatedData.imageUrl = `/uploads/${req.file.filename}`;
          updatedData.imagePublicId = '';
        }
      } else {
        updatedData.imageUrl = `/uploads/${req.file.filename}`;
        updatedData.imagePublicId = '';
      }
    }

    complaint = await Complaint.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete complaint (Student only, before review)
// @route   DELETE /api/complaints/:id
// @access  Private
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Authorize deletion: Allow Admin/Super Admin to delete any complaint; Students can only delete their own if still "Submitted"
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    if (!isAdmin) {
      // Enforce student ownership
      if (complaint.studentId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this complaint' });
      }

      // Check if complaint has already been reviewed
      if (complaint.status !== 'Submitted') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete complaint once review or action has started.',
        });
      }
    }

    // Clean up images
    if (complaint.imagePublicId && isConfigured) {
      await cloudinary.uploader.destroy(complaint.imagePublicId);
    } else if (complaint.imageUrl && !complaint.imagePublicId) {
      // Local clean
      const localPath = path.join(__dirname, '..', complaint.imageUrl);
      if (fs.existsSync(localPath)) {
        try {
          fs.unlinkSync(localPath);
        } catch (e) {
          console.error('Error deleting local file:', e.message);
        }
      }
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit reply/comment in complaint thread
// @route   POST /api/complaints/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty' });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Enforce privacy rule
    if (req.user.role === 'student' && complaint.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to this complaint' });
    }

    if (
      req.user.role === 'admin' &&
      complaint.assignedTo &&
      complaint.assignedTo !== req.user.name &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to reply to other admins complaints' });
    }

    // Append reply
    complaint.replies.push({
      senderId: req.user.id,
      message,
    });

    await complaint.save();

    // Populate and return updated complaint replies
    const updatedComplaint = await Complaint.findById(req.params.id)
      .populate('replies.senderId', 'name email role');

    res.status(200).json({ success: true, data: updatedComplaint.replies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
