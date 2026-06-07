import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { User, Lock, Loader2, Save } from 'lucide-react';

const roles = [
  'Frontend Developer', 'Backend Developer', 'MERN Developer', 'Full Stack Developer',
  'Data Analyst', 'Software Engineer', 'DevOps Engineer', 'AI/ML Engineer', 'Product Manager'
];
const levels = ['fresher', 'junior', 'mid', 'senior'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    targetRole: user?.targetRole || '',
    experienceLevel: user?.experienceLevel || 'fresher'
  });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await API.put('/auth/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (password.new !== password.confirm) return toast.error('Passwords do not match');
    if (password.new.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPass(true);
    try {
      await API.put('/auth/change-password', { currentPassword: password.current, newPassword: password.new });
      setPassword({ current: '', new: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar + Info */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{user?.name}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className={`badge mt-1 capitalize text-xs ${user?.role === 'admin' ? 'bg-purple-950 text-purple-300' : 'bg-gray-800 text-gray-400'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-950 rounded-lg flex items-center justify-center">
            <User size={15} className="text-blue-400" />
          </div>
          <h2 className="font-semibold text-white">Personal Information</h2>
        </div>

        <div>
          <label className="label">Full Name</label>
          <input
            className="input"
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Email</label>
          <input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
          <p className="text-gray-600 text-xs mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="label">Target Role</label>
          <select className="input" value={profile.targetRole} onChange={e => setProfile({ ...profile, targetRole: e.target.value })}>
            <option value="">Select a role</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Experience Level</label>
          <div className="grid grid-cols-4 gap-2">
            {levels.map(l => (
              <button
                key={l}
                onClick={() => setProfile({ ...profile, experienceLevel: l })}
                className={`py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  profile.experienceLevel === l ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <button onClick={saveProfile} disabled={savingProfile} className="btn-primary flex items-center gap-2">
          {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {/* Password Form */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-purple-950 rounded-lg flex items-center justify-center">
            <Lock size={15} className="text-purple-400" />
          </div>
          <h2 className="font-semibold text-white">Change Password</h2>
        </div>

        <div>
          <label className="label">Current Password</label>
          <input type="password" className="input" placeholder="••••••••" value={password.current} onChange={e => setPassword({ ...password, current: e.target.value })} />
        </div>
        <div>
          <label className="label">New Password</label>
          <input type="password" className="input" placeholder="Min. 6 characters" value={password.new} onChange={e => setPassword({ ...password, new: e.target.value })} />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input type="password" className="input" placeholder="Repeat new password" value={password.confirm} onChange={e => setPassword({ ...password, confirm: e.target.value })} />
        </div>

        <button onClick={savePassword} disabled={savingPass} className="btn-primary flex items-center gap-2">
          {savingPass ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          Change Password
        </button>
      </div>

      {/* Account Details */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Account Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Member since</span>
            <span className="text-gray-300">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Account type</span>
            <span className="text-gray-300 capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Experience level</span>
            <span className="text-gray-300 capitalize">{user?.experienceLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
