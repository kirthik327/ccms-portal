import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Upload, Image as ImageIcon, Send, ArrowLeft, Trash } from 'lucide-react';

const ComplaintSubmit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingComplaint = location.state?.complaint || null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [roomLocation, setRoomLocation] = useState('');
  const [priority, setPriority] = useState('Low');
  
  // Image Upload States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
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
  ];

  const departments = [
    'Information Technology',
    'Computer Science and Engineering',
    'Aeronautical Engineering',
    'Food Technology',
    'Civil Engineering',
    'Agricultural Engineering',
    'Cyber Security',
    'Artificial Intelligence and Machine Learning',
    'Computer and Communication Engineering',
    'Science and Humanities(1st Year)',
    'Master of Business Administration(MBA)'
  ];

  useEffect(() => {
    if (editingComplaint) {
      setTitle(editingComplaint.title || '');
      setDescription(editingComplaint.description || '');
      setCategory(editingComplaint.category || '');
      setDepartment(editingComplaint.department || '');
      setRoomLocation(editingComplaint.location || '');
      setPriority(editingComplaint.priority || 'Low');
      if (editingComplaint.imageUrl) {
        setImagePreview(editingComplaint.imageUrl);
      }
    }
  }, [editingComplaint]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !category || !department || !roomLocation || !priority) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setSubmitting(true);

    // Use FormData for file upload support
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('department', department);
    formData.append('location', roomLocation);
    formData.append('priority', priority);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      let res;
      if (editingComplaint) {
        // Update existing complaint
        res = await axios.put(`/api/complaints/${editingComplaint._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Submit new complaint
        res = await axios.post('/api/complaints', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            {editingComplaint ? 'Modify Grievance' : 'Submit New Grievance'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {editingComplaint
              ? 'Update details before reviewing has initiated'
              : 'Submit a confidential complaint directly to college admins'}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-600 dark:border-rose-900/35 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Submission Form Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Complaint Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water leaking in Canteen; Short circuit in Room 201"
              maxLength={100}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 py-3.5 px-4 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detailed Description *
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specific details such as the issue duration, serial numbers, severity, and any actions taken."
              rows={5}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 py-3.5 px-4 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 py-3.5 px-4 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                disabled={submitting}
              >
                <option value="" disabled className="dark:bg-slate-900">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Department to Address *
              </label>
              <select
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 py-3.5 px-4 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                disabled={submitting}
              >
                <option value="" disabled className="dark:bg-slate-900">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept} className="dark:bg-slate-900">{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Building or Room Location *
              </label>
              <input
                type="text"
                required
                value={roomLocation}
                onChange={(e) => setRoomLocation(e.target.value)}
                placeholder="e.g. Science Block, Room 102; Boys Hostel Wing B"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 py-3.5 px-4 text-sm bg-transparent outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-800 dark:text-white"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Priority *
              </label>
              <div className="mt-1.5 flex gap-4">
                {['Low', 'Medium', 'High'].map((p) => (
                  <label
                    key={p}
                    className={`flex flex-1 cursor-pointer items-center justify-center rounded-2xl border py-3.5 px-4 text-sm font-semibold transition-all ${
                      priority === p
                        ? 'border-primary bg-primary/5 text-primary dark:border-primary-light dark:bg-primary-light/10 dark:text-primary-light'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={() => setPriority(p)}
                      className="sr-only"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Photo upload section */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Attach Supporting Photo (Optional, max 5MB)
            </label>
            
            <div className="mt-2.5 flex flex-col gap-4">
              {!imagePreview ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 py-8 px-6 transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <span className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Click to upload image
                  </span>
                  <span className="mt-1 text-xs text-slate-400">PNG, JPG, JPEG, WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                    disabled={submitting}
                  />
                </label>
              ) : (
                <div className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <img
                    src={imagePreview.startsWith('/') ? (window.location.port === '5173' ? `http://localhost:5000${imagePreview}` : (window.location.hostname.includes('vercel.app') ? `https://ccms-nit.onrender.com${imagePreview}` : imagePreview)) : imagePreview}
                    alt="Upload Preview"
                    className="max-h-64 rounded-xl object-contain shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-6 right-6 rounded-xl bg-rose-500 p-2 text-white shadow-md hover:bg-rose-600 transition-all"
                    title="Remove Photo"
                    disabled={submitting}
                  >
                    <Trash className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/10 transition-all hover:bg-primary-hover disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {editingComplaint ? 'Updating Grievance...' : 'Submitting Grievance...'}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {editingComplaint ? 'Update Complaint' : 'File Complaint'}
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
};

export default ComplaintSubmit;
