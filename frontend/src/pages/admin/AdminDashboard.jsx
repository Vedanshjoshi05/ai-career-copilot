import { useEffect, useState } from 'react';
import API from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, FileText, Video, TrendingUp, Shield, Loader2, Search } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    API.get('/admin/stats').then(r => setStats(r.data.stats)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    API.get(`/admin/users?page=${page}&limit=10&search=${search}`)
      .then(r => { setUsers(r.data.users); setPagination(r.data.pagination || {}); })
      .catch(console.error);
  }, [page, search]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={28} /></div>;

  const roleChartData = stats?.popularRoles?.map(r => ({
    role: r._id?.length > 12 ? r._id.slice(0, 12) + '…' : r._id,
    count: r.count
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-950 rounded-lg flex items-center justify-center">
          <Shield size={20} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Platform overview and user management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-950' },
          { label: 'Total Resumes', value: stats?.totalResumes ?? 0, icon: FileText, color: 'text-green-400', bg: 'bg-green-950' },
          { label: 'Interviews Done', value: stats?.totalInterviews ?? 0, icon: Video, color: 'text-purple-400', bg: 'bg-purple-950' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="text-gray-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Popular Roles Chart */}
      {roleChartData.length > 0 && (
        <div className="card">
          <h2 className="section-title">Popular Interview Roles</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roleChartData} margin={{ top: 5, right: 5, left: -20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="role" tick={{ fill: '#6b7280', fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} labelStyle={{ color: '#f9fafb' }} itemStyle={{ color: '#93c5fd' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {roleChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* User Management */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">User Management</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input pl-8 py-2 text-sm w-52"
              placeholder="Search users..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Target</th>
                <th className="pb-3 pr-4">Level</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`badge capitalize text-xs ${u.role === 'admin' ? 'bg-purple-950 text-purple-300' : 'bg-gray-800 text-gray-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{u.targetRole || '—'}</td>
                  <td className="py-3 pr-4 text-gray-300 capitalize">{u.experienceLevel}</td>
                  <td className="py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <p className="text-gray-500">
              Showing {users.length} of {pagination.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                Prev
              </button>
              <span className="py-1.5 px-3 text-gray-400">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Users */}
      {stats?.recentUsers?.length > 0 && (
        <div className="card">
          <h2 className="section-title">Recent Signups</h2>
          <div className="space-y-2">
            {stats.recentUsers.slice(0, 5).map(u => (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{u.name}</p>
                    <p className="text-gray-500 text-xs">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-500 text-xs capitalize">{u.experienceLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
