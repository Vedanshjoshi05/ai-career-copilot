// ResumeList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { FileText, Trash2, Upload, Loader2, ExternalLink } from 'lucide-react';

export function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    API.get('/resume').then(r => setResumes(r.data.resumes)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteResume = async (id) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await API.delete(`/resume/${id}`);
      toast.success('Resume deleted');
      setResumes(prev => prev.filter(r => r._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={28} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Resumes</h1>
          <p className="text-gray-400 text-sm mt-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} analyzed</p>
        </div>
        <div className="flex gap-2">
          <Link to="/resume/tailor" className="btn-secondary flex items-center gap-2 text-sm">Resume Tailor</Link>
          <Link to="/resume/upload" className="btn-primary flex items-center gap-2 text-sm"><Upload size={14} />Upload New</Link>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No resumes yet. Upload your first resume!</p>
          <Link to="/resume/upload" className="btn-primary inline-flex mt-4">Upload Resume</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map(r => (
            <div key={r._id} className="card hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-950 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{r.fileName}</p>
                    <p className="text-gray-500 text-sm">{new Date(r.createdAt).toLocaleDateString()} • {r.targetRole || 'No target role'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-400">Overall: <span className="text-white font-semibold">{r.analysis?.overallScore ?? '—'}%</span></p>
                    <p className="text-sm text-gray-400">ATS: <span className="text-green-400 font-semibold">{r.analysis?.atsScore ?? '—'}%</span></p>
                  </div>
                  <button onClick={() => deleteResume(r._id)} className="text-gray-500 hover:text-red-400 p-2 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {r.analysis?.technicalSkills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.analysis.technicalSkills.slice(0, 6).map((s, i) => (
                    <span key={i} className="badge bg-gray-800 text-gray-400">{s}</span>
                  ))}
                  {r.analysis.technicalSkills.length > 6 && (
                    <span className="badge bg-gray-800 text-gray-500">+{r.analysis.technicalSkills.length - 6}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumeList;
