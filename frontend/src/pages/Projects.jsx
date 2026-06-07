import { useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FolderGit2, Loader2, Code2, Zap, Trophy, Clock } from 'lucide-react';

const difficultyConfig = {
  beginner: { color: 'text-green-400', bg: 'bg-green-950', border: 'border-green-800', icon: '🌱' },
  intermediate: { color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-800', icon: '⚡' },
  advanced: { color: 'text-red-400', bg: 'bg-red-950', border: 'border-red-800', icon: '🔥' },
};

function ProjectCard({ project }) {
  const [expanded, setExpanded] = useState(false);
  const diff = project.difficulty?.toLowerCase() || 'beginner';
  const config = difficultyConfig[diff] || difficultyConfig.beginner;

  return (
    <div className={`card border hover:border-gray-600 transition-all ${expanded ? config.border : 'border-gray-800'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge ${config.bg} ${config.color} capitalize text-xs`}>
              {config.icon} {project.difficulty}
            </span>
            {project.estimatedTime && (
              <span className="badge bg-gray-800 text-gray-400 text-xs flex items-center gap-1">
                <Clock size={10} /> {project.estimatedTime}
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-lg">{project.title}</h3>
          <p className="text-gray-400 text-sm mt-1">{project.description}</p>
        </div>
      </div>

      {/* Tech Stack */}
      {project.techStack?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {project.techStack.map((t, i) => (
            <span key={i} className="badge bg-blue-950 text-blue-300 text-xs flex items-center gap-1">
              <Code2 size={9} /> {t}
            </span>
          ))}
        </div>
      )}

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        {expanded ? '▲ Show less' : '▼ Show features & outcomes'}
      </button>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
          {project.features?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Zap size={10} />Features to Build</p>
              <ul className="space-y-1">
                {project.features.map((f, i) => (
                  <li key={i} className="text-xs text-gray-300 flex gap-2">
                    <span className="text-blue-400">•</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.learningOutcomes?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Trophy size={10} />Learning Outcomes</p>
              <ul className="space-y-1">
                {project.learningOutcomes.map((o, i) => (
                  <li key={i} className="text-xs text-gray-300 flex gap-2">
                    <span className="text-green-400">✓</span>{o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('all');

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const { data } = await API.post('/projects/recommend', { targetRole });
      setProjects(data.projects || []);
      toast.success('Projects recommended!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.difficulty?.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Project Recommendations</h1>
        <p className="text-gray-400 text-sm mt-1">AI-curated projects based on your skill level and target role</p>
      </div>

      {/* Config */}
      <div className="card max-w-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-950 rounded-lg flex items-center justify-center">
            <FolderGit2 size={20} className="text-orange-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Get Project Ideas</h2>
            <p className="text-gray-500 text-sm">We'll use your resume skills automatically</p>
          </div>
        </div>
        <div>
          <label className="label">Target Role (optional)</label>
          <input
            className="input"
            placeholder="e.g. MERN Developer"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
          />
        </div>
        <button onClick={handleRecommend} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading
            ? <><Loader2 size={16} className="animate-spin" />Generating ideas...</>
            : <><FolderGit2 size={16} />Get Project Ideas</>
          }
        </button>
      </div>

      {/* Filter + Results */}
      {projects.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? `All (${projects.length})` : `${f} (${projects.filter(p => p.difficulty?.toLowerCase() === f).length})`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((project, i) => (
              <ProjectCard key={i} project={project} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card text-center py-10">
              <p className="text-gray-400">No projects in this difficulty level</p>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {projects.length === 0 && !loading && (
        <div className="card text-center py-16">
          <FolderGit2 size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-1">No projects yet</p>
          <p className="text-gray-600 text-sm">Click "Get Project Ideas" to get personalized recommendations</p>
        </div>
      )}
    </div>
  );
}
