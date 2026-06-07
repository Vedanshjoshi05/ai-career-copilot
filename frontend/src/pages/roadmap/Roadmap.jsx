import { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { Map, Loader2, CheckCircle, Circle, ChevronDown, ChevronUp, Plus } from 'lucide-react';

const roles = [
  'Frontend Developer', 'Backend Developer', 'MERN Developer', 'Full Stack Developer',
  'Data Analyst', 'Software Engineer', 'DevOps Engineer', 'AI/ML Engineer',
  'React Developer', 'Node.js Developer', 'Product Manager', 'Cloud Engineer'
];

function RoadmapCard({ roadmap, onProgressUpdate }) {
  const [expanded, setExpanded] = useState(null);
  const totalMonths = roadmap.roadmap?.length || 0;
  const completedMonths = roadmap.roadmap?.filter(m => m.completed).length || 0;
  const progress = totalMonths > 0 ? Math.round((completedMonths / totalMonths) * 100) : 0;

  const toggleMonth = async (idx) => {
    const newVal = !roadmap.roadmap[idx].completed;
    try {
      const { data } = await API.put(`/roadmap/${roadmap._id}/progress`, { monthIndex: idx, completed: newVal });
      onProgressUpdate(data.roadmap);
      toast.success(newVal ? 'Month marked complete!' : 'Month unmarked');
    } catch {
      toast.error('Failed to update progress');
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{roadmap.targetRole}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
            <span>{roadmap.estimatedDuration}</span>
            <span>•</span>
            <span className="capitalize">{roadmap.difficulty}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-400">{progress}%</p>
          <p className="text-xs text-gray-500">{completedMonths}/{totalMonths} months</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="score-bar h-2 mb-5">
        <div className="score-fill bg-blue-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Prerequisites */}
      {roadmap.prerequisites?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Prerequisites</p>
          <div className="flex flex-wrap gap-1">
            {roadmap.prerequisites.map((p, i) => (
              <span key={i} className="badge bg-gray-800 text-gray-400 text-xs">{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Months */}
      <div className="space-y-2">
        {roadmap.roadmap?.map((month, idx) => (
          <div key={idx} className={`rounded-lg border transition-colors ${month.completed ? 'border-green-800 bg-green-950/20' : 'border-gray-800 bg-gray-800/50'}`}>
            <div
              className="flex items-center justify-between p-3 cursor-pointer"
              onClick={() => setExpanded(expanded === idx ? null : idx)}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMonth(idx); }}
                  className="text-gray-500 hover:text-green-400 transition-colors"
                >
                  {month.completed
                    ? <CheckCircle size={20} className="text-green-400" />
                    : <Circle size={20} />
                  }
                </button>
                <div>
                  <p className={`font-medium text-sm ${month.completed ? 'text-green-300 line-through' : 'text-white'}`}>
                    Month {month.month}: {month.title}
                  </p>
                  <p className="text-xs text-gray-500">{month.topics?.length} topics • {month.milestones?.length} milestones</p>
                </div>
              </div>
              <button className="text-gray-500">
                {expanded === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {expanded === idx && (
              <div className="px-4 pb-4 border-t border-gray-700 mt-2 pt-3 space-y-3">
                {month.topics?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Topics to Cover</p>
                    <div className="flex flex-wrap gap-1">
                      {month.topics.map((t, i) => (
                        <span key={i} className="badge bg-blue-950 text-blue-300 text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {month.resources?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Resources</p>
                    <ul className="space-y-1">
                      {month.resources.map((r, i) => (
                        <li key={i} className="text-xs text-gray-400 flex gap-2"><span className="text-blue-400">→</span>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {month.milestones?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Milestones</p>
                    <ul className="space-y-1">
                      {month.milestones.map((m, i) => (
                        <li key={i} className="text-xs text-gray-400 flex gap-2"><span className="text-green-400">✓</span>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Roadmap() {
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    API.get('/roadmap')
      .then(r => setRoadmaps(r.data.roadmaps || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleGenerate = async () => {
    if (!targetRole) return toast.error('Please select a target role');
    setLoading(true);
    try {
      const { data } = await API.post('/roadmap/generate', { targetRole });
      setRoadmaps(prev => [data.roadmap, ...prev]);
      setShowForm(false);
      setTargetRole('');
      toast.success('Roadmap generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const updateRoadmap = (updatedRoadmap) => {
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
  };

  if (fetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={28} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Career Roadmap</h1>
          <p className="text-gray-400 text-sm mt-1">AI-generated personalized learning roadmaps</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />New Roadmap
        </button>
      </div>

      {/* Generate Form */}
      {showForm && (
        <div className="card max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-950 rounded-lg flex items-center justify-center">
              <Map size={16} className="text-yellow-400" />
            </div>
            <h2 className="font-semibold text-white">Generate New Roadmap</h2>
          </div>
          <div>
            <label className="label">Target Role</label>
            <select className="input" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
              <option value="">Select role</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={handleGenerate} disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" />Generating...</> : 'Generate Roadmap'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Roadmaps */}
      {roadmaps.length === 0 ? (
        <div className="card text-center py-16">
          <Map size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-1">No roadmaps yet</p>
          <p className="text-gray-600 text-sm">Generate your first personalized career roadmap</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex mt-4">
            Generate Roadmap
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {roadmaps.map(r => (
            <RoadmapCard key={r._id} roadmap={r} onProgressUpdate={updateRoadmap} />
          ))}
        </div>
      )}
    </div>
  );
}
