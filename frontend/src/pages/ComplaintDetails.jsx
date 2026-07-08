import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  User,
  Building,
  Tag,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  FileText,
  UserCheck,
  XCircle,
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const chatEndRef = useRef(null);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  useEffect(() => {
    // Scroll to bottom of chat when replies load
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [complaint?.replies]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const res = await axios.post(`/api/complaints/${id}/reply`, { message: replyMessage });
      if (res.data.success) {
        setComplaint((prev) => ({
          ...prev,
          replies: res.data.data,
        }));
        setReplyMessage('');
      }
    } catch (err) {
      alert('Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  // Status Icons
  const getTimelineIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-indigo-500" />;
      case 'Assigned':
        return <UserCheck className="h-5 w-5 text-blue-500" />;
      case 'Under Review':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5 text-slate-500" />;
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'High':
        return 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400';
      case 'Medium':
        return 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400';
      case 'In Progress':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xs text-slate-500">Retrieving complaint history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/10 dark:text-rose-400">
        <h4 className="font-bold">Access Denied</h4>
        <p className="mt-1 text-xs">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      
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
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${getStatusBadge(complaint.status)}`}>
            {complaint.status}
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">
            {complaint.title}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Main Details and Chat log */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Content */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Grievance Description
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-350 whitespace-pre-line">
              {complaint.description}
            </p>

            {/* Optional Photo Attachment */}
            {complaint.imageUrl && (
              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Supporting Photo Attachment
                </h4>
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950/40">
                  <a
                    href={complaint.imageUrl.startsWith('/') ? `${window.location.protocol}//${window.location.hostname}:5000${complaint.imageUrl}` : complaint.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={complaint.imageUrl.startsWith('/') ? `${window.location.protocol}//${window.location.hostname}:5000${complaint.imageUrl}` : complaint.imageUrl}
                      alt="Complaint Attachment"
                      className="max-h-80 rounded-xl object-contain hover:scale-[1.01] transition-transform"
                    />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Back-and-forth Communication Panel */}
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900 flex flex-col h-[400px]">
            
            {/* Header info */}
            <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800 flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Resolution Comments Thread
              </h3>
            </div>

            {/* Message Bubble Log */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {complaint.replies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <MessageSquare className="h-10 w-10 stroke-1" />
                  <p className="mt-2 text-xs">No comments yet. Send a message to start conversation.</p>
                </div>
              ) : (
                complaint.replies.map((reply) => {
                  const isMe = reply.senderId._id === user.id;
                  const isSenderAdmin = reply.senderId.role !== 'student';
                  return (
                    <div key={reply._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1">
                        <span>{reply.senderId.name}</span>
                        {isSenderAdmin && (
                          <span className="rounded bg-primary/10 px-1 py-0.2 text-[8px] text-primary dark:text-primary-light">
                            Staff
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs max-w-sm whitespace-pre-line leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {reply.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input TextBox */}
            <form onSubmit={handleSendReply} className="border-t border-slate-100 p-4 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your comment or update reply..."
                className="flex-1 rounded-xl border border-slate-200 py-3 px-4 text-xs bg-transparent outline-none focus:border-primary dark:border-slate-800 dark:text-white"
                disabled={sendingReply}
              />
              <button
                type="submit"
                disabled={sendingReply || !replyMessage.trim()}
                className="rounded-xl bg-primary px-4 py-3 text-white transition-all hover:bg-primary-hover disabled:opacity-55 shadow-md shadow-primary/15"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>

        </div>

        {/* Metadata Sidebar details */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Grievance Meta
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Tag className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{complaint.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority Level</span>
                  <div className="mt-1">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${getPriorityBadge(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Building / Room</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{complaint.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filing Date</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <User className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filed By</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{complaint.studentId?.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {complaint.studentId?.department} • Year: {complaint.studentId?.year}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <UserCheck className="h-4.5 w-4.5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Staff</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {complaint.assignedTo || 'Unassigned / Pending Alloc'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Action History */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Activity History Timeline
            </h3>
            
            <div className="relative pl-6 space-y-5 before:absolute before:top-2 before:left-2 before:h-[calc(100%-12px)] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {complaint.history.map((log) => (
                <div key={log._id} className="relative text-xs">
                  {/* Bullet */}
                  <div className="absolute -left-6 top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white dark:bg-slate-900">
                    {getTimelineIcon(log.status)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{log.status}</span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      {new Date(log.updatedAt).toLocaleDateString()}
                    </span>
                    <p className="text-[10px] leading-relaxed text-slate-500 mt-1">{log.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ComplaintDetails;
