import { useEffect, useState } from 'react';
import API from '../utils/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell
} from 'recharts';
import { Loader2, BarChart3, Trophy, TrendingUp, Target } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/interview/analytics')
      .then(r => setAnalytics(r.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={28} /></div>;

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
        <div className="card text-center py-16">
          <BarChart3 size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-1">No data yet</p>
          <p className="text-gray-600 text-sm">Complete at least one mock interview to see your analytics</p>
        </div>
      </div>
    );
  }

  const trendData = analytics.trendData?.map((d, i) => ({
    name: `#${i + 1}`,
    score: d.score,
    role: d.role,
  })) || [];

  const roleData = Object.entries(analytics.roleCounts || {})
    .map(([role, count]) => ({ role: role.length > 15 ? role.slice(0, 15) + '…' : role, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Performance Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Track your interview performance over time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Interviews', value: analytics.totalInterviews, icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-950' },
          { label: 'Average Score', value: `${analytics.averageScore}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-950' },
          { label: 'Best Score', value: `${analytics.bestScore}%`, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-950' },
          { label: 'Roles Practiced', value: Object.keys(analytics.roleCounts || {}).length, icon: Target, color: 'text-green-400', bg: 'bg-green-950' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-gray-400 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Performance Trend */}
      {trendData.length > 1 && (
        <div className="card">
          <h2 className="section-title">Score Trend (Last 10 Interviews)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="score" stroke="#3b82f6"
                strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6, fill: '#60a5fa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Role Distribution */}
      {roleData.length > 0 && (
        <div className="card">
          <h2 className="section-title">Interviews by Role</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roleData} margin={{ top: 5, right: 5, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="role" tick={{ fill: '#6b7280', fontSize: 11 }} angle={-25} textAnchor="end" />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }} labelStyle={{ color: '#f9fafb' }} itemStyle={{ color: '#93c5fd' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Interviews Table */}
      {analytics.recentInterviews?.length > 0 && (
        <div className="card">
          <h2 className="section-title">Recent Interview Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-2 pr-4">Role</th>
                  <th className="pb-2 pr-4">Difficulty</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {analytics.recentInterviews.map(i => (
                  <tr key={i._id}>
                    <td className="py-3 pr-4 text-white">{i.role}</td>
                    <td className="py-3 pr-4">
                      <span className={`badge capitalize text-xs ${
                        i.difficulty === 'easy' ? 'bg-green-950 text-green-300'
                          : i.difficulty === 'hard' ? 'bg-red-950 text-red-300'
                          : 'bg-yellow-950 text-yellow-300'
                      }`}>
                        {i.difficulty}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`font-bold ${i.score >= 70 ? 'text-green-400' : i.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {i.score}%
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(i.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
