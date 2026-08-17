import { useState, useEffect } from 'react';
import { User, Target, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPersons, getPersonById, getJobs, getSkillGaps, getRecommendations } from '../lib/api';

export default function Profile() {
  const [persons, setPersons] = useState([]);
  const [jobs, setJobs] = useState([]);
  
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  
  const [personData, setPersonData] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  const [loading, setLoading] = useState(true);

  // Load initial dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, jRes] = await Promise.all([getPersons(), getJobs()]);
        setPersons(pRes.data);
        setJobs(jRes.data);
        if (pRes.data.length > 0) {
          setSelectedPerson(pRes.data[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load person details and recommendations
  useEffect(() => {
    if (selectedPerson) {
      const fetchPersonData = async () => {
        try {
          const [pData, rData] = await Promise.all([
            getPersonById(selectedPerson),
            getRecommendations(selectedPerson)
          ]);
          setPersonData(pData.data);
          setRecommendations(rData.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchPersonData();
    }
  }, [selectedPerson]);

  // Load skill gaps when job changes
  useEffect(() => {
    if (selectedPerson && selectedJobId) {
      const fetchGaps = async () => {
        try {
          const res = await getSkillGaps(selectedPerson, selectedJobId);
          setSkillGaps(res.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchGaps();
    } else {
      setSkillGaps([]);
    }
  }, [selectedPerson, selectedJobId]);

  if (loading) return <div className="animate-pulse glass-card h-[80vh]"></div>;

  const targetJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
            <User className="text-primary" /> Profile & Career Path
          </h1>
          <p className="text-secondary text-lg">Analyze your skills and discover your next move.</p>
        </div>
        
        <div className="w-full md:w-64">
          <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Select Profile</label>
          <select 
            className="w-full bg-cards border border-white/10 rounded-lg py-2 px-3 text-text focus:border-primary/50 outline-none"
            value={selectedPerson || ''}
            onChange={(e) => setSelectedPerson(e.target.value)}
          >
            {persons.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
            ))}
          </select>
        </div>
      </div>

      {personData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Skills and Gap Analysis */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                Your Current Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {personData.skills?.map(skill => (
                  <span key={skill.id} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> {skill.name}
                  </span>
                ))}
                {(!personData.skills || personData.skills.length === 0) && (
                  <p className="text-secondary italic">No skills recorded.</p>
                )}
              </div>
            </div>

            <div className="glass-card p-6 border-l-4 border-l-warning">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Target className="text-warning" /> Skill Gap Analysis
                </h2>
                
                <select 
                  className="bg-background border border-white/10 rounded-lg py-1.5 px-3 text-sm text-text focus:border-warning/50 outline-none w-full sm:w-auto"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                >
                  <option value="">Select Target Role...</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>

              {!selectedJobId ? (
                <p className="text-secondary text-center py-8">Select a target role to see your skill gaps.</p>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                  <p className="text-sm text-secondary">
                    Comparing your profile against <strong className="text-text">{targetJob?.title}</strong> requirements:
                  </p>
                  
                  {skillGaps.length === 0 ? (
                    <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-success flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6" />
                      <div>
                        <p className="font-bold">You're a perfect match!</p>
                        <p className="text-sm opacity-80">You have all the required skills for this role.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="font-medium text-warning flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Missing {skillGaps.length} required skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skillGaps.map(skill => (
                          <Link 
                            key={skill.id} 
                            to={`/skills?id=${skill.id}`}
                            className="px-3 py-1.5 bg-warning/10 text-warning border border-warning/20 rounded-lg text-sm hover:bg-warning/20 transition-colors flex items-center gap-2"
                          >
                            <AlertTriangle className="w-3 h-3" /> {skill.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recommendations */}
          <div className="glass-card p-6 bg-gradient-to-br from-cards to-primary/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-success" /> AI Job Recommendations
            </h2>
            <p className="text-sm text-secondary mb-6">
              Based on a multi-hop graph analysis of your current skills and related adjacent skills, these roles are the most logical next step.
            </p>

            {recommendations.length === 0 ? (
              <p className="text-secondary text-center py-8">No recommendations found.</p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <Link 
                    key={rec.id} 
                    to={`/jobs/${rec.id}`}
                    className="block p-4 bg-background border border-white/5 rounded-lg hover:border-primary/50 hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-text group-hover:text-primary transition-colors">{rec.title}</h3>
                      <div className="flex flex-col items-end">
                         <span className="text-xs text-secondary uppercase tracking-wider mb-1">Match Score</span>
                         <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                           rec.score > 2 ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                         }`}>
                           {rec.score > 2 ? 'High' : 'Medium'} ({rec.score})
                         </span>
                      </div>
                    </div>
                    <p className="text-xs text-secondary">{rec.level}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}
