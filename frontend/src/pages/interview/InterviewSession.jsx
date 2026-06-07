import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { Loader2, ChevronRight, CheckCircle, Award } from 'lucide-react';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    API.get(`/interview/${id}`)
      .then(r => setInterview(r.data.interview))
      .catch(() => toast.error('Interview not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={28} /></div>;
  if (!interview) return <div className="text-center text-gray-400 py-20">Interview not found</div>;

  const questions = interview.questions;
  const currentQ = questions[currentIdx];
  const isLast = currentIdx === questions.length - 1;
  const answered = questions.filter(q => q.answered).length;

  const submitAnswer = async () => {
    if (!answer.trim()) return toast.error('Please write an answer');
    setSubmitting(true);
    try {
      const { data } = await API.post(`/interview/${id}/answer`, {
        questionId: currentQ._id,
        answer
      });
      setEvaluation(data.evaluation);
      const updated = { ...interview };
      updated.questions[currentIdx].answered = true;
      updated.questions[currentIdx].evaluation = data.evaluation;
      setInterview(updated);
      toast.success('Answer evaluated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    setEvaluation(null);
    setAnswer('');
    setCurrentIdx(i => i + 1);
  };

  const completeInterview = async () => {
    setCompleting(true);
    try {
      const { data } = await API.post(`/interview/${id}/complete`);
      setInterview(data.interview);
      setCompleted(true);
      toast.success('Interview completed!');
    } catch (err) {
      toast.error('Failed to complete interview');
    } finally {
      setCompleting(false);
    }
  };

  if (completed && interview.status === 'completed') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="card text-center py-10">
          <Award size={48} className="text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Interview Complete!</h1>
          <p className="text-gray-400">Final Score</p>
          <p className="text-6xl font-bold text-blue-400 my-4">{interview.overallScore}%</p>
          <div className="grid grid-cols-2 gap-4 mt-6 text-left">
            <div>
              <p className="text-gray-500 text-sm mb-2">Strengths</p>
              {interview.feedback?.strongTopics?.map((t, i) => <p key={i} className="text-sm text-green-400">✓ {t}</p>)}
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-2">Improve On</p>
              {interview.feedback?.weakTopics?.map((t, i) => <p key={i} className="text-sm text-red-400">✗ {t}</p>)}
            </div>
          </div>
          <div className="flex gap-3 mt-8 justify-center">
            <button onClick={() => navigate('/interview')} className="btn-primary">New Interview</button>
            <button onClick={() => navigate('/analytics')} className="btn-secondary">View Analytics</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{interview.role} Interview</h1>
          <p className="text-gray-400 text-sm capitalize">{interview.difficulty} • {interview.experienceLevel}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Question {currentIdx + 1} of {questions.length}</p>
          <p className="text-xs text-gray-500">{answered} answered</p>
        </div>
      </div>

      <div className="score-bar h-2">
        <div className="score-fill bg-blue-500" style={{ width: `${((currentIdx) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <span className={`badge ${currentQ.type === 'technical' ? 'bg-blue-950 text-blue-300' : currentQ.type === 'behavioral' ? 'bg-purple-950 text-purple-300' : 'bg-green-950 text-green-300'} capitalize`}>
            {currentQ.type}
          </span>
        </div>
        <p className="text-lg text-white font-medium leading-relaxed">{currentQ.question}</p>
      </div>

      {/* Answer or Evaluation */}
      {!evaluation ? (
        <div className="card">
          <label className="label">Your Answer</label>
          <textarea
            className="input h-36 resize-none"
            placeholder="Type your answer here..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={currentQ.answered}
          />
          {!currentQ.answered && (
            <button onClick={submitAnswer} disabled={submitting} className="btn-primary mt-3 flex items-center gap-2">
              {submitting ? <><Loader2 size={16} className="animate-spin" />Evaluating...</> : <>Submit Answer</>}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="card border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Evaluation</h3>
              <span className={`text-2xl font-bold ${evaluation.score >= 70 ? 'text-green-400' : evaluation.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {evaluation.score}%
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[
                { label: 'Technical', val: evaluation.technicalAccuracy },
                { label: 'Communication', val: evaluation.communication },
                { label: 'Confidence', val: evaluation.confidence },
                { label: 'Clarity', val: evaluation.clarity },
                { label: 'Problem Solving', val: evaluation.problemSolving },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold text-white">{s.val}/10</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
            {evaluation.idealAnswer && (
              <div className="bg-gray-800 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-500 mb-1">Ideal Answer</p>
                <p className="text-sm text-gray-300">{evaluation.idealAnswer}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!isLast ? (
              <button onClick={nextQuestion} className="btn-primary flex items-center gap-2">
                Next Question <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={completeInterview} disabled={completing} className="btn-primary flex items-center gap-2">
                {completing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Complete Interview
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
