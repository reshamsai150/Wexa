import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Network, Briefcase, Code2, ArrowRight } from 'lucide-react';
import { getJobs, getSkills, getPersons } from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ jobs: 0, skills: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsRes, skillsRes, personsRes] = await Promise.all([
          getJobs(),
          getSkills(),
          getPersons()
        ]);
        setStats({
          jobs: jobsRes.data.length,
          skills: skillsRes.data.length,
          users: personsRes.data.length
        });
        setError(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Good afternoon 👋</h1>
        <p className="text-secondary text-lg">Explore where your skills can take you.</p>
      </div>

      {error && (
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-warning">
            <Network className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold">Database Disconnected</p>
              <p className="text-sm opacity-90">Please configure your CognoDB credentials in backend/.env and run the seed script.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col gap-4 group hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-secondary font-medium uppercase tracking-wider">Total Skills</p>
              <h2 className="text-3xl font-bold">
                {loading ? '-' : error ? <span className="text-warning text-xl">Offline</span> : stats.skills}
              </h2>
            </div>
          </div>
          <Link to="/skills" className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
            Explore Skills <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 group hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-secondary font-medium uppercase tracking-wider">Available Jobs</p>
              <h2 className="text-3xl font-bold">
                {loading ? '-' : error ? <span className="text-warning text-xl">Offline</span> : stats.jobs}
              </h2>
            </div>
          </div>
          <Link to="/jobs" className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
            Browse Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 group hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-secondary font-medium uppercase tracking-wider">Graph Nodes</p>
              <h2 className="text-3xl font-bold">
                {loading ? '-' : error ? <span className="text-warning text-xl">Offline</span> : (stats.jobs + stats.skills + stats.users)}
              </h2>
            </div>
          </div>
          <Link to="/explore" className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
            Open Graph <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="glass-card p-8 text-center mt-12 bg-gradient-to-br from-cards to-primary/5">
        <Network className="w-16 h-16 text-primary mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl font-bold text-text mb-4">Discover Your Career Path</h2>
        <p className="text-secondary max-w-2xl mx-auto mb-8 text-lg">
          CareerGraph analyzes the relationships between skills, roles, and projects to map out the most logical steps for your career growth.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/profile" className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
            Analyze My Skills
          </Link>
          <Link to="/explore" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-text border border-white/10 rounded-lg font-medium transition-colors">
            Explore the Graph
          </Link>
        </div>
      </div>
    </div>
  );
}
