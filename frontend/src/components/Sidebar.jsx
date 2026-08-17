import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Code2, Network, User } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Skills', path: '/skills', icon: Code2 },
  { name: 'Graph Explorer', path: '/explore', icon: Network },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-cards h-screen border-r border-white/5 p-6 flex flex-col justify-between fixed">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <Network className="text-primary w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight text-text">CareerGraph</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'text-secondary hover:text-text hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <div className="border-t border-white/10 pt-6">
          <Link
            to="/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === '/profile'
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                : 'text-secondary hover:text-text hover:bg-white/5'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
