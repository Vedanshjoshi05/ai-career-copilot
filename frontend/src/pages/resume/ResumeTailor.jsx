import { useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { Loader2, Target, CheckCircle, X } from 'lucide-react';

export default function ResumeTailor() {
  const [form, setForm] = useState({ resumeText: '', jobDescription: '', jobTitle: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!form.jobDescription) return toast.error('Job description is required');
    if (!form.resumeText) return toast.error('Resume text is required');
    setLoading(true);
    try {
      const { data } = await API.post('/resume/tailor', form);
      setResult(data.jobMatch);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Resume Tailor</h1>
        <p className="text-gray-400 text-sm mt-1">Optimize your resume for a specific job description</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Your Information</h2>
          <div>
            <label className="label">Resume Text (paste your resume)</label>
            <textarea className="input h-48 resize-none" placeholder="Paste your resume text here..." value={form.resumeText} onChange={e => setForm({...form, resumeText: e.target.value})} />
          </div>
          <div>
            <label className="label">Job Title</label>
            <input className="input" placeholder="e.g. Frontend Developer" value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" placeholder="e.g. Google" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-white">Job Description</h2>
          <textarea className="input h-64 resize-none" placeholder="Paste the full job description here..." value={form.jobDescription} onChange={e => setForm({...form, jobDescription: e.target.value})} />
        </div>
      </div>

      <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
        {loading ? <><Loader2 size={16} className="animate-spin" />Analyzing...</> : <><Target size={16} />Tailor Resume</>}
      </button>

      {result && (
        <div className="space-y-4">
          <div className="card text-center">
            <p className="text-gray-400 text-sm mb-1">ATS Match Score</p>
            <p className="text-5xl font-bold text-white">{result.atsMatchScore}<span className="text-2xl text-gray-500">%</span></p>
            <div className="mt-3 max-w-xs mx-auto">
              <div className="score-bar h-3">
                <div className={`score-fill ${result.atsMatchScore >= 70 ? 'bg-green-500' : result.atsMatchScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${result.atsMatchScore}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-green-400 mb-3">Matching Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchingKeywords?.map((k, i) => <span key={i} className="badge bg-green-950 text-green-300">{k}</span>)}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-red-400 mb-3">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords?.map((k, i) => <span key={i} className="badge bg-red-950 text-red-300">{k}</span>)}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-blue-400 mb-3">Suggested Bullet Points</h3>
            <ul className="space-y-2">
              {result.suggestedBulletPoints?.map((b, i) => <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-blue-400">•</span>{b}</li>)}
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-3">Overall Feedback</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{result.overallFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
