import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { Video, Loader2, History } from 'lucide-react';

const roles = ['Frontend Developer', 'Backend Developer', 'MERN Developer', 'Full Stack Developer', 'Data Analyst', 'Software Engineer', 'DevOps Engineer', 'Product Manager'];
const difficulties = ['easy', 'medium', 'hard'];
const levels = ['fresher', 'junior', 'mid', 'senior'];

export default function MockInterview() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: '', difficulty: 'medium', experienceLevel: 'fresher', questionCount: 5 });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleStart = async () => {
    if (!form.role) return toast.error('Please select a role');
    setLoading(true);
    try {
      const { data } = await API.post('/interview/start', form);
      navigate(`/interview/${data.interview._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mock Interview</h1>
          <p className="text-gray-400 text-sm mt-1">Practice with AI-generated questions and get instant evaluation</p>
        </div>
        <Link to="/interview/history" className="btn-secondary flex items-center gap-2 text-sm">
          <History size={14} />History
        </Link>
      </div>

      <div className="card max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-950 rounded-lg flex items-center justify-center">
            <Video size={20} className="text-green-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Configure Interview</h2>
            <p className="text-gray-500 text-sm">Set your preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Target Role *</label>
            <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="">Select role</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Difficulty</label>
              <div className="flex gap-2">
                {difficulties.map(d => (
                  <button
                    key={d}
                    onClick={() => set('difficulty', d)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                      form.difficulty === d
                        ? d === 'easy' ? 'bg-green-600 text-white' : d === 'medium' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Questions</label>
              <select className="input" value={form.questionCount} onChange={e => set('questionCount', parseInt(e.target.value))}>
                {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Experience Level</label>
            <div className="grid grid-cols-4 gap-2">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => set('experienceLevel', l)}
                  className={`py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                    form.experienceLevel === l ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleStart} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" />Generating questions...</> : <><Video size={16} />Start Interview</>}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="card max-w-lg">
        <h3 className="font-semibold text-white mb-3">Interview Tips</h3>
        <ul className="space-y-2">
          {['Answer clearly and concisely', 'Use STAR method for behavioral questions', 'Explain your thought process', 'It\'s okay to think before answering'].map((tip, i) => (
            <li key={i} className="text-sm text-gray-400 flex gap-2">
              <span className="text-blue-400 font-bold">{i + 1}.</span>{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
