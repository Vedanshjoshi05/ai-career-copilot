import { Link } from 'react-router-dom';
import { Briefcase, Brain, BarChart3, Map, FileText, Video, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Resume Analyzer', desc: 'AI-powered ATS scoring and recruiter feedback', color: 'text-blue-400' },
  { icon: Brain, title: 'Skill Gap Detector', desc: 'Compare your skills to industry requirements', color: 'text-purple-400' },
  { icon: Video, title: 'Mock Interviews', desc: 'Practice with AI-generated questions and get evaluated', color: 'text-green-400' },
  { icon: Map, title: 'Career Roadmap', desc: 'Personalized 6-month learning roadmaps', color: 'text-yellow-400' },
  { icon: BarChart3, title: 'Performance Analytics', desc: 'Track your interview progress over time', color: 'text-pink-400' },
  { icon: Briefcase, title: 'Job Tailoring', desc: 'Optimize your resume for specific job descriptions', color: 'text-cyan-400' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase size={16} />
          </div>
          <span className="font-bold text-lg">AI Career Copilot</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started Free</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-24 px-6">
        <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          AI-powered career preparation
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Land Your Dream<br />
          <span className="text-blue-500">Internship</span> with AI
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Analyze resumes, practice mock interviews, detect skill gaps, and get personalized career roadmaps — all powered by AI.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary flex items-center gap-2 text-base py-3 px-6">
            Start Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary text-base py-3 px-6">Login</Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Everything you need to get hired</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-gray-600 transition-colors">
                <f.icon size={24} className={`${f.color} mb-3`} />
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-gray-800 py-16 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[['AI Analysis', 'Resume + Skills'], ['Mock Interviews', '10 Questions/Session'], ['Success Rate', 'Portfolio-ready']].map(([title, val]) => (
            <div key={title}>
              <p className="text-2xl font-bold text-blue-400">{val}</p>
              <p className="text-gray-500 text-sm mt-1">{title}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-800 py-6 text-center text-gray-600 text-sm">
        © 2024 AI Career Copilot — Built for internship-ready developers
      </footer>
    </div>
  );
}
