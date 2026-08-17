import { useState, useEffect } from 'react';
import { User, Target, AlertTriangle, CheckCircle2, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPersons, getPersonById, getJobs, getSkillGaps, getRecommendations, getSkills, addPersonSkill } from '../lib/api';

export default function Profile() {
  const [persons, setPersons] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  
  const [personData, setPersonData] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, jRes, sRes] = await Promise.all([getPersons(), getJobs(), getSkills()]);
        setPersons(pRes.data);
        setJobs(jRes.data);
        setAllSkills(sRes.data);
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

  const fetchPersonData = async () => {
    if (!selectedPerson) return;
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

  // Load person details and recommendations
  useEffect(() => {
    fetchPersonData();
  }, [selectedPerson]);

  const fetchGaps = async () => {
    if (!selectedPerson || !selectedJobId) {
      setSkillGaps([]);
      return;
    }
    try {
      const res = await getSkillGaps(selectedPerson, selectedJobId);
      setSkillGaps(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Load skill gaps when job changes
  useEffect(() => {
    fetchGaps();
  }, [selectedPerson, selectedJobId]);

  const handleAddSkillSubmit = async () => {
    if (!selectedSkill || !selectedPerson) return;
    setIsSubmitting(true);
    try {
      await addPersonSkill(selectedPerson, selectedSkill);
      await fetchPersonData();
      await fetchGaps();
      setIsAdding(false);
      setSelectedSkill('');
    } catch (error) {
      console.error('Failed to add skill:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="animate-pulse glass-card h-[80vh]"></div>;

  const targetJob = jobs.find(j => j.id === selectedJobId);
  
  // FIX: Filter out skills the user already possesses from the gaps list
  const userSkillNames = personData?.skills?.map(s => s.name) || [];
  const trueMissingSkills = skillGaps.filter(jobSkill => !userSkillNames.includes(jobSkill.name));

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
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Your Current Skills
                </h2>
                
                {isAdding ? (
                  <div className="flex items-center gap-2">
                    <select 
                      value={selectedSkill} 
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="bg-background text-text px-2 py-1 rounded border border-white/10 text-sm outline-none focus:border-primary/50"
                      disabled={isSubmitting}
                    >
                      <option value="">Select Skill...</option>
                      {allSkills.filter(s => !userSkillNames.includes(s.name)).map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleAddSkillSubmit}
                      disabled={isSubmitting || !selectedSkill}
                      className="bg-primary px-3 py-1 rounded text-sm font-bold hover:bg-primary/90 text-background disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsAdding(false)}
                      disabled={isSubmitting}
                      className="text-secondary hover:text-text text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-full transition-colors border border-primary/30"
                  >
                    <Plus className="w-3 h-3" /> Add Skill
                  </button>
                )}
              </div>
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
                  
                  {trueMissingSkills.length === 0 ? (
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
                        <AlertTriangle className="w-4 h-4" /> Missing {trueMissingSkills.length} required skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trueMissingSkills.map(skill => (
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
                      <div className="flex flex-col items-end w-32">
                        <span className="text-xs text-secondary uppercase tracking-wider mb-1">Match Score</span>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-1 mb-1">
                          <div 
                            className={`h-full rounded-full ${rec.score > 4 ? 'bg-success' : 'bg-primary'}`} 
                            style={{ width: `${Math.min(rec.score * 15, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-secondary font-medium">
                          {Math.min(rec.score * 15, 100)}% Match ({rec.score} skills)
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
