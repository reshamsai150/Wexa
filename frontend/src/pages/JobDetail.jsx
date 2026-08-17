import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, Code2, Network } from 'lucide-react';
import { getJobById } from '../lib/api';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await getJobById(id);
        setJob(res.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-secondary hover:text-text transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">{job.title}</h1>
            <span className="px-3 py-1 bg-white/10 text-secondary rounded-full text-sm font-medium">
              {job.level}
            </span>
          </div>
          
          <Link 
            to={`/explore?jobId=${job.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <Network className="w-4 h-4" /> Explore Graph
          </Link>
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
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-text">Required Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.skills && job.skills.map(skill => (
              <Link 
                key={skill.id} 
                to={`/skills?id=${skill.id}`}
                className="px-4 py-2 bg-cards border border-white/10 rounded-lg text-sm hover:border-primary/50 hover:text-primary transition-colors"
              >
                {skill.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
