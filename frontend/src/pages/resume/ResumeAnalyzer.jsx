import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

const ScoreBar = ({ label, value, color = 'bg-blue-500' }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-300">{label}</span>
      <span className="text-white font-medium">{value}%</span>
    </div>
    <div className="score-bar">
      <div className={`score-fill ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const TagList = ({ items, color = 'bg-gray-800 text-gray-300' }) => (
  <div className="flex flex-wrap gap-2">
    {items?.map((item, i) => (
      <span key={i} className={`badge ${color} text-xs px-2 py-1 rounded`}>{item}</span>
    ))}
  </div>
);

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a PDF file');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (targetRole) formData.append('targetRole', targetRole);
      const { data } = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data.resume);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const a = result?.analysis;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Resume Analyzer</h1>
          <p className="text-gray-400 text-sm mt-1">Upload your PDF resume for AI-powered analysis</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-950/30' : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={32} className="text-gray-500 mx-auto mb-3" />
          {file ? (
            <div>
              <p className="text-green-400 font-medium">{file.name}</p>
              <p className="text-gray-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-300">Drop your PDF resume here or click to browse</p>
              <p className="text-gray-500 text-sm mt-1">Max size: 5MB</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            className="input flex-1"
            placeholder="Target role (optional, e.g. MERN Developer)"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
          />
          <button onClick={handleUpload} disabled={loading || !file} className="btn-primary flex items-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" />Analyzing...</> : <><FileText size={16} />Analyze Resume</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && a && (
        <div className="space-y-4">
          {/* Score Overview */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Overall Score', value: a.overallScore, color: 'bg-blue-500' },
              { label: 'ATS Score', value: a.atsScore, color: 'bg-green-500' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <p className="text-gray-400 text-sm mb-2">{s.label}</p>
                <p className="text-4xl font-bold text-white">{s.value}<span className="text-xl text-gray-500">%</span></p>
                <div className="mt-3"><ScoreBar label="" value={s.value} color={s.color} /></div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-white mb-3">Technical Skills</h3>
              <TagList items={a.technicalSkills} color="bg-blue-950 text-blue-300" />
            </div>
            <div className="card">
              <h3 className="font-semibold text-white mb-3">Soft Skills</h3>
              <TagList items={a.softSkills} color="bg-purple-950 text-purple-300" />
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2"><CheckCircle size={16} />Strengths</h3>
              <ul className="space-y-2">
                {a.strengths?.map((s, i) => <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-green-400 mt-0.5">✓</span>{s}</li>)}
              </ul>
            </div>
            <div className="card">
              <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertCircle size={16} />Weaknesses</h3>
              <ul className="space-y-2">
                {a.weaknesses?.map((w, i) => <li key={i} className="text-sm text-gray-300 flex gap-2"><span className="text-red-400 mt-0.5">✗</span>{w}</li>)}
              </ul>
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="card">
            <h3 className="font-semibold text-yellow-400 mb-3">Missing Keywords</h3>
            <TagList items={a.missingKeywords} color="bg-yellow-950 text-yellow-300" />
          </div>

          {/* Recruiter Feedback */}
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Recruiter Feedback</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{a.recruiterFeedback}</p>
          </div>

          {/* Improvement Suggestions */}
          <div className="card">
            <h3 className="font-semibold text-blue-400 mb-3">Improvement Suggestions</h3>
            <ul className="space-y-2">
              {a.improvementSuggestions?.map((s, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-blue-400 font-bold mt-0.5">{i + 1}.</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
