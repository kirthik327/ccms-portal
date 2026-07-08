const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a complaint title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a complaint description'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Infrastructure',
      'Classroom',
      'Laboratory',
      'Library',
      'Hostel',
      'Transport',
      'Canteen',
      'Wi-Fi / Internet',
      'Electrical Issues',
      'Water Supply',
      'Cleanliness',
      'Sports Facilities',
      'Faculty Related',
      'Anti-Ragging',
      'Other',
    ],
  },
  department: {
    type: String,
    required: [true, 'Please select a department'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Please specify building or location'],
    trim: true,
  },
  priority: {
    type: String,
    required: [true, 'Please select priority level'],
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  status: {
    type: String,
    enum: ['Submitted', 'Assigned', 'Resolved'],
    default: 'Submitted',
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  imagePublicId: {
    type: String,
    default: '',
  },
  replies: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      message: {
        type: String,
        required: true,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  history: [
    {
      status: {
        type: String,
        required: true,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      note: {
        type: String,
        default: '',
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
