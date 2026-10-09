import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { storage } from '../services/storage';
import { User, Lock, Mail, Phone, Calendar, Shield, Save, ArrowLeft } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateProfile, changePassword } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) {
    onNavigate('login');
    return null;
  }

  const enrollments = storage.getStudentEnrollments(user.id);
  const enrolledCourses = enrollments.map((e: any) => storage.getCourseById(e.courseId)).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    updateProfile({ name, phone });

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        error('New passwords do not match.');
        setSaving(false);
        return;
      }
      const res = await changePassword(newPassword);
      if (!res.success) {
        error(res.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    success('Profile updated successfully.');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => onNavigate(user.role === 'admin' ? 'admin' : 'dashboard')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {user.role === 'admin' ? 'Admin Console' : 'My Dashboard'}</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#0B2147] text-white flex items-center justify-center font-bold text-2xl">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold text-[#0B2147]">{user.name}</h1>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{user.email}</span>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-blue-700 capitalize">{user.role} Profile</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Managed by Pathfinder Registrar. Contact administration to modify.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98450 11223"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Account ID
                </label>
                <input
                  type="text"
                  disabled
                  value={user.id}
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 bg-slate-50 text-slate-500 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Security & Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2147]"
                  />
                </div>
              </div>
            </div>

            {/* Enrolled Courses Overview */}
            {user.role === 'student' && (
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Active Course Allocations</h3>
                <div className="space-y-2">
                  {enrolledCourses.map((c: any) => (
                    <div
                      key={c?.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800">{c?.title}</span>
                      <span className="font-semibold text-emerald-700">Enrolled & Active</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onNavigate(user.role === 'admin' ? 'admin' : 'dashboard')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
