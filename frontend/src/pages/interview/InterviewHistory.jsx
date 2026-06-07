import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';
import { Loader2, Video, Trophy } from 'lucide-react';

export default function InterviewHistory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/interview').then(r => setData(r.data.interviews)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={28} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Interview History</h1>
        <Link to="/interview" className="btn-primary text-sm">New Interview</Link>
      </div>

      {data.length === 0 ? (
        <div className="card text-center py-16">
          <Video size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No interviews yet. Start your first one!</p>
          <Link to="/interview" className="btn-primary inline-flex mt-4">Start Interview</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map(i => (
            <div key={i._id} className="card hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium">{i.role}</p>
                    <span className={`badge capitalize text-xs ${i.status === 'completed' ? 'bg-green-950 text-green-300' : 'bg-yellow-950 text-yellow-300'}`}>
                      {i.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm capitalize">{i.difficulty} • {i.experienceLevel} • {i.totalQuestions} questions</p>
                  <p className="text-gray-600 text-xs mt-1">{new Date(i.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  {i.status === 'completed' && (
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className={i.overallScore >= 70 ? 'text-yellow-400' : 'text-gray-500'} />
                      <span className={`text-2xl font-bold ${i.overallScore >= 70 ? 'text-green-400' : i.overallScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {i.overallScore}%
                      </span>
                    </div>
                  )}
                  {i.status === 'in-progress' && (
                    <Link to={`/interview/${i._id}`} className="btn-secondary text-sm">Resume</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
