import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Video, BarChart3, Target, Upload, Play, Brain, Map, ArrowRight, Loader2 } from 'lucide-react';

const ScoreRing = ({ score, size = 80, stroke = 8, color = '#3b82f6' }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard').then(r => setData(r.data.dashboard)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">
          {user?.targetRole ? `Working towards: ${user.targetRole}` : 'Set your target role to get personalized insights'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Resumes Analyzed', value: stats.totalResumes ?? 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-950' },
          { label: 'Interviews Done', value: stats.totalInterviews ?? 0, icon: Video, color: 'text-green-400', bg: 'bg-green-950' },
          { label: 'Avg Interview Score', value: `${stats.avgInterviewScore ?? 0}%`, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-950' },
          { label: 'ATS Score', value: `${stats.latestAtsScore ?? 0}%`, icon: Target, color: 'text-yellow-400', bg: 'bg-yellow-950' },
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

      {/* Scores + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score overview */}
        <div className="card">
          <h2 className="section-title">Performance Overview</h2>
          <div className="flex items-center justify-around py-4">
            {[
              { label: 'ATS Score', score: stats.latestAtsScore ?? 0, color: '#3b82f6' },
              { label: 'Avg Interview', score: stats.avgInterviewScore ?? 0, color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="relative inline-flex">
                  <ScoreRing score={s.score} color={s.color} />
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                    {s.score}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="section-title">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/resume/upload', icon: Upload, label: 'Upload & Analyze Resume', color: 'text-blue-400' },
              { to: '/interview', icon: Play, label: 'Start Mock Interview', color: 'text-green-400' },
              { to: '/skills', icon: Brain, label: 'Analyze Skill Gap', color: 'text-purple-400' },
              { to: '/roadmap', icon: Map, label: 'Generate Career Roadmap', color: 'text-yellow-400' },
            ].map(a => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <a.icon size={18} className={a.color} />
                  <span className="text-sm text-gray-200">{a.label}</span>
                </div>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Resumes */}
      {data?.recentResumes?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Recent Resumes</h2>
            <Link to="/resume" className="text-blue-400 hover:text-blue-300 text-sm">View all</Link>
          </div>
          <div className="space-y-2">
            {data.recentResumes.map(r => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-blue-400" />
                  <div>
                    <p className="text-sm text-white">{r.fileName}</p>
                    <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{r.analysis?.overallScore ?? '—'}%</p>
                  <p className="text-xs text-gray-500">ATS: {r.analysis?.atsScore ?? '—'}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Interviews */}
      {data?.recentInterviews?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Recent Interviews</h2>
            <Link to="/interview/history" className="text-blue-400 hover:text-blue-300 text-sm">View all</Link>
          </div>
          <div className="space-y-2">
            {data.recentInterviews.map(i => (
              <div key={i._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                <div>
                  <p className="text-sm text-white">{i.role}</p>
                  <p className="text-xs text-gray-500 capitalize">{i.difficulty} • {i.experienceLevel}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${i.overallScore >= 70 ? 'text-green-400' : i.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {i.overallScore}%
                  </p>
                  <p className="text-xs text-gray-500">{new Date(i.completedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
