import { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { Brain, Loader2, CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

const roles = [
  'Frontend Developer', 'Backend Developer', 'MERN Developer', 'Full Stack Developer',
  'Data Analyst', 'Software Engineer', 'DevOps Engineer', 'AI/ML Engineer',
  'React Developer', 'Node.js Developer', 'Product Manager'
];

export default function SkillGap() {
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    API.get('/skills').then(r => setHistory(r.data.analyses || [])).catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!targetRole) return toast.error('Please select a target role');
    setLoading(true);
    try {
      const skillsArray = currentSkills
        ? currentSkills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const { data } = await API.post('/skills/analyze', { targetRole, currentSkills: skillsArray });
      setResult(data.skillAnalysis);
      setHistory(prev => [data.skillAnalysis, ...prev.slice(0, 4)]);
      toast.success('Skill gap analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const readiness = result?.readinessScore ?? 0;
  const readinessColor = readiness >= 70 ? 'text-green-400' : readiness >= 40 ? 'text-yellow-400' : 'text-red-400';
  const barColor = readiness >= 70 ? 'bg-green-500' : readiness >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Skill Gap Analyzer</h1>
        <p className="text-gray-400 text-sm mt-1">Compare your current skills to industry requirements for your target role</p>
      </div>

      {/* Input Card */}
      <div className="card max-w-xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-950 rounded-lg flex items-center justify-center">
            <Brain size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Configure Analysis</h2>
            <p className="text-gray-500 text-sm">We'll also use your latest resume skills automatically</p>
          </div>
        </div>

        <div>
          <label className="label">Target Role *</label>
          <select className="input" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
            <option value="">Select target role</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Current Skills (optional, comma-separated)</label>
          <input
            className="input"
            placeholder="e.g. React, Node.js, MongoDB, CSS"
            value={currentSkills}
            onChange={e => setCurrentSkills(e.target.value)}
          />
          <p className="text-gray-600 text-xs mt-1">Leave empty to auto-detect from your latest resume</p>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 size={16} className="animate-spin" />Analyzing...</>
            : <><Brain size={16} />Analyze Skill Gap</>
          }
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Readiness Score */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Readiness for {result.targetRole}</h2>
              <span className={`text-3xl font-bold ${readinessColor}`}>{readiness}%</span>
            </div>
            <div className="score-bar h-4 mb-2">
              <div className={`score-fill ${barColor}`} style={{ width: `${readiness}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Beginner</span><span>Intermediate</span><span>Job-Ready</span>
            </div>
            {result.estimatedTimeToReady && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                <Clock size={14} className="text-blue-400" />
                Estimated time to ready: <span className="text-white font-medium">{result.estimatedTimeToReady}</span>
              </div>
            )}
          </div>

          {/* Skills Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle size={16} /> Skills You Have ({result.matchingSkills?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills?.length > 0
                  ? result.matchingSkills.map((s, i) => (
                      <span key={i} className="badge bg-green-950 text-green-300 flex items-center gap-1">
                        <CheckCircle size={10} /> {s}
                      </span>
                    ))
                  : <p className="text-gray-500 text-sm">No matching skills found</p>
                }
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                <XCircle size={16} /> Skills to Learn ({result.missingSkills?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills?.length > 0
                  ? result.missingSkills.map((s, i) => (
                      <span key={i} className="badge bg-red-950 text-red-300 flex items-center gap-1">
                        <XCircle size={10} /> {s}
                      </span>
                    ))
                  : <p className="text-gray-500 text-sm">No missing skills!</p>
                }
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">All Required Skills for {result.targetRole}</h3>
            <div className="flex flex-wrap gap-2">
              {result.requiredSkills?.map((s, i) => {
                const has = result.matchingSkills?.includes(s);
                return (
                  <span key={i} className={`badge flex items-center gap-1 ${has ? 'bg-green-950 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
                    {has ? <CheckCircle size={10} /> : <XCircle size={10} />} {s}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Priority Learning Path */}
          {result.priorityLearningPath?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <TrendingUp size={16} /> Priority Learning Path
              </h3>
              <div className="space-y-3">
                {result.priorityLearningPath.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-yellow-400 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-yellow-400 mt-0.5">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {!result && history.length > 0 && (
        <div className="card">
          <h2 className="section-title">Previous Analyses</h2>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setResult(h)}
              >
                <div>
                  <p className="text-white font-medium text-sm">{h.targetRole}</p>
                  <p className="text-gray-500 text-xs">{new Date(h.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-lg font-bold ${h.readinessScore >= 70 ? 'text-green-400' : h.readinessScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {h.readinessScore}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
