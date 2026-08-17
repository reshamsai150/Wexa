import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, Code2, Network, CheckCircle2, XCircle, Briefcase } from 'lucide-react';
import { getJobById, getPersons, getPersonById } from '../lib/api';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, personsRes] = await Promise.all([
          getJobById(id),
          getPersons()
        ]);
        
        setJob(jobRes.data);
        
        // Mock a logged in user (grab the first one, e.g. Alice/Bob)
        if (personsRes.data && personsRes.data.length > 0) {
          const profileRes = await getPersonById(personsRes.data[0].id);
          setUserProfile(profileRes.data);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="animate-pulse glass-card h-96"></div>;
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text mb-4">Job not found</h2>
        <Link to="/jobs" className="text-primary hover:underline">Return to jobs</Link>
      </div>
    );
  }

  // Calculate Match Percentage
  const userSkillNames = userProfile ? userProfile.skills.map(s => s.name) : [];
  const requiredSkillNames = job.skills ? job.skills.map(s => s.name) : [];
  const matchedSkills = requiredSkillNames.filter(s => userSkillNames.includes(s));
  const matchPercentage = requiredSkillNames.length > 0 
    ? Math.round((matchedSkills.length / requiredSkillNames.length) * 100) 
    : 100;

  let matchColor = "text-red-400 bg-red-400/10 border-red-400/30";
  if (matchPercentage >= 70) matchColor = "text-green-400 bg-green-400/10 border-green-400/30";
  else if (matchPercentage >= 40) matchColor = "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";

  const handleApply = () => {
    // Mocking an API call to record application in CognoDB
    setApplied(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-secondary hover:text-text transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2 pr-10">{job.title}</h1>
            <div className="flex gap-3 mt-3">
              <span className="px-3 py-1 bg-white/10 text-secondary rounded-full text-sm font-medium">
                {job.level}
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                Remote: {job.remote !== false ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Match Badge */}
            {userProfile && (
              <div className={`px-4 py-2 rounded-lg font-bold border ${matchColor}`}>
                {matchPercentage}% Skill Match
              </div>
            )}
            
            <Link 
              to={`/explore?jobId=${job.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-cards text-text border border-white/10 rounded-lg hover:border-white/30 transition-colors"
            >
              <Network className="w-4 h-4 text-primary" /> Explore Graph
            </Link>

            <button 
              onClick={handleApply}
              disabled={applied}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-colors ${
                applied 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-primary text-background hover:bg-primary/90 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              }`}
            >
              <Briefcase className="w-4 h-4" /> 
              {applied ? 'Applied' : 'Apply Now'}
            </button>
          </div>
        </div>

        {job.company && (
          <div className="flex items-center gap-2 text-secondary mb-8 pb-8 border-b border-white/10">
            <Building className="w-5 h-5 text-primary" />
            <span className="font-medium text-text">{job.company.name}</span>
            <span className="px-2">•</span>
            <span>{job.company.industry}</span>
            <span className="px-2">•</span>
            <span>{job.company.location}</span>
          </div>
        )}

        <div className="mb-10">
          <h2 className="text-xl font-bold text-text mb-4">About this Role</h2>
          <p className="text-secondary leading-relaxed text-lg">{job.description}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-text">Required Skills</h2>
            </div>
            {userProfile && (
              <span className="text-sm text-secondary">
                Comparing against profile: <strong className="text-text">{userProfile.name}</strong>
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {job.skills && job.skills.map(skill => {
              const hasSkill = userSkillNames.includes(skill.name);
              return (
                <Link 
                  key={skill.id} 
                  to={`/skills?id=${skill.id}`}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
                    hasSkill 
                      ? 'bg-green-400/5 border-green-400/20 hover:border-green-400/50' 
                      : 'bg-cards border-white/10 hover:border-primary/50'
                  }`}
                >
                  {hasSkill ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-white/20" />
                  )}
                  <span className={hasSkill ? 'text-green-50 font-medium' : 'text-secondary'}>
                    {skill.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
