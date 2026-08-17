import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Code2, ArrowRight, Briefcase } from 'lucide-react';
import { getSkills, getSkillById } from '../lib/api';

export default function Skills() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSkillId = searchParams.get('id');
  
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getSkills();
        setSkills(res.data);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    if (selectedSkillId) {
      const fetchDetail = async () => {
        try {
          const res = await getSkillById(selectedSkillId);
          setSelectedSkill(res.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchDetail();
    } else {
      setSelectedSkill(null);
    }
  }, [selectedSkillId]);

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 animate-in fade-in duration-500">
      <div className="w-1/3 glass-card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-bold flex items-center gap-2 text-text">
            <Code2 className="w-5 h-5 text-primary" /> Skills
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-10 animate-pulse bg-white/5 rounded-lg"></div>)}
            </div>
          ) : (
            skills.map(skill => (
              <button
                key={skill.id}
                onClick={() => setSearchParams({ id: skill.id })}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex justify-between items-center ${
                  selectedSkillId === skill.id 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'text-secondary hover:bg-white/5 hover:text-text'
                }`}
              >
                <span>{skill.name}</span>
                {selectedSkillId === skill.id && <ArrowRight className="w-4 h-4" />}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 glass-card overflow-y-auto p-8 relative">
        {!selectedSkillId ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-50">
            <Code2 className="w-16 h-16 text-primary mb-4" />
            <p className="text-xl">Select a skill to view its relationships</p>
          </div>
        ) : !selectedSkill ? (
          <div className="animate-pulse h-full bg-white/5 rounded-lg"></div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div>
              <h1 className="text-4xl font-bold text-text mb-2">{selectedSkill.name}</h1>
              <p className="text-secondary text-lg">Technology / Skill</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-text mb-4 border-b border-white/10 pb-2">Related Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSkill.relatedSkills && selectedSkill.relatedSkills.length > 0 ? (
                  selectedSkill.relatedSkills.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSearchParams({ id: s.id })}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-primary/50 transition-colors flex items-center gap-2"
                    >
                      {s.name} <ArrowRight className="w-3 h-3 opacity-50" />
                    </button>
                  ))
                ) : (
                  <p className="text-secondary italic">No related skills found in graph.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-text mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> Used In
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSkill.jobs && selectedSkill.jobs.length > 0 ? (
                  selectedSkill.jobs.map(j => (
                    <Link
                      key={j.id}
                      to={`/jobs/${j.id}`}
                      className="p-4 bg-cards border border-white/10 rounded-lg hover:border-primary/50 transition-colors group"
                    >
                      <h4 className="font-bold text-text group-hover:text-primary transition-colors">{j.title}</h4>
                      <p className="text-sm text-secondary">{j.level}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-secondary italic">No jobs currently explicitly require this skill.</p>
                )}
              </div>
            </div>
            
            <div className="pt-8">
               <Link 
                  to={`/explore?skillId=${selectedSkill.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Explore in Graph <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
