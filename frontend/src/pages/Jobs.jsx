import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building, Search } from 'lucide-react';
import { getJobs } from '../lib/api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getJobs();
        setJobs(res.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    (job.company && job.company.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Job Explorer</h1>
          <p className="text-secondary text-lg">Find roles and discover required skills.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-5 h-5" />
          <input
            type="text"
            placeholder="Search roles or companies..."
            className="w-full bg-cards border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-text focus:outline-none focus:border-primary/50 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card p-6 h-32 animate-pulse bg-white/5"></div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <Briefcase className="w-12 h-12 text-secondary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-text mb-2">No matching jobs found</h3>
          <p className="text-secondary">Try searching for Frontend, AI, or Java.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="block group">
              <div className="glass-card p-6 h-full border border-white/5 hover:border-primary/40 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">{job.title}</h3>
                  <span className="px-2.5 py-1 text-xs font-medium bg-white/10 text-secondary rounded-full">
                    {job.level}
                  </span>
                </div>
                
                {job.company && (
                  <div className="flex items-center gap-2 text-secondary text-sm mb-4">
                    <Building className="w-4 h-4" />
                    <span>{job.company.name}</span>
                    <span className="px-1.5 opacity-50">•</span>
                    <span>{job.company.location}</span>
                  </div>
                )}
                
                <p className="text-sm text-secondary line-clamp-2">{job.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
