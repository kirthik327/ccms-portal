const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Get dashboard analytics
// @route   GET /api/admin/stats
// @access  Private (Admin & Super Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const total = await Complaint.countDocuments();
    const submitted = await Complaint.countDocuments({ status: 'Submitted' });
    const underReview = 0;
    const assigned = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgress = 0;
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = 0;

    const pending = total - resolved;
    const highPriority = await Complaint.countDocuments({
      priority: 'High',
      status: { $ne: 'Resolved' },
    });

    // Registered user counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalStaff = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });

    // 1. Department-wise stats
    const deptStatsRaw = await Complaint.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);
    const departmentStats = deptStatsRaw.map((item) => ({
      department: item._id,
      count: item.count,
    }));

    // 2. Category-wise stats
    const catStatsRaw = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const categoryStats = catStatsRaw.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    // 3. Monthly stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyStatsRaw = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = monthlyStatsRaw.map((item) => {
      const monthName = months[item._id.month - 1];
      return {
        month: `${monthName} ${item._id.year}`,
        count: item.count,
      };
    });

    // 4. Average Resolution Time (in hours)
    const resolvedComplaints = await Complaint.find({ status: 'Resolved' });
    let totalTimeMs = 0;
    let resolvedCount = 0;

    resolvedComplaints.forEach((comp) => {
      const resolvedLog = comp.history
        .slice()
        .reverse()
        .find((h) => h.status === 'Resolved');
      if (resolvedLog) {
        totalTimeMs += resolvedLog.updatedAt.getTime() - comp.createdAt.getTime();
        resolvedCount++;
      }
    });

    const averageResolutionTimeHours =
      resolvedCount > 0 ? parseFloat((totalTimeMs / (1000 * 60 * 60 * resolvedCount)).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        resolved,
        highPriority,
        totalStudents,
        totalStaff,
        breakdown: {
          submitted,
          underReview,
          assigned,
          inProgress,
          resolved,
          rejected,
        },
        averageResolutionTimeHours,
        departmentStats,
        categoryStats,
        monthlyStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign complaint to a staff member
// @route   PUT /api/admin/assign/:id
// @access  Private (Admin & Super Admin)
exports.assignComplaint = async (req, res) => {
  try {
    const { staffId, note } = req.body; // staffId is the typed staff name string from the admin

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Please provide a Staff Name to assign' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Enforce super admin permission if assigned to someone else and req.user is a regular admin
    if (
      req.user.role === 'admin' &&
      complaint.assignedTo &&
      complaint.assignedTo !== req.user.name &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only Super Admins can reassign complaints assigned to other admins',
      });
    }

    complaint.assignedTo = staffId;
    // Auto transition status to Assigned if currently Submitted
    if (complaint.status === 'Submitted') {
      complaint.status = 'Assigned';
    }

    complaint.history.push({
      status: complaint.status,
      updatedBy: req.user.id,
      note: note || `Complaint assigned to ${staffId}.`,
    });

    await complaint.save();

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/admin/status/:id
// @access  Private (Admin & Super Admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status' });
    }

    const allowedStatuses = ['Submitted', 'Assigned', 'Resolved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check permissions: regular admin can only modify complaints assigned to them (or unassigned ones)
    if (
      req.user.role === 'admin' &&
      complaint.assignedTo &&
      complaint.assignedTo !== req.user.name &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change status of complaints assigned to other admins',
      });
    }

    complaint.status = status;
    complaint.history.push({
      status,
      updatedBy: req.user.id,
      note: note || `Status updated to ${status}.`,
    });

    await complaint.save();

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all admin / staff members (for assignment dropdown)
// @route   GET /api/admin/staff
// @access  Private (Admin & Super Admin)
exports.getStaffList = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select(
      'name email department employeeId role'
    );
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registered students (for admin directory)
// @route   GET /api/admin/students
// @access  Private (Admin & Super Admin)
exports.getStudentsList = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email rollNumber department year createdAt')
      .sort({ name: 1 });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
