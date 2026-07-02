import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserCog, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  Search,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  Clipboard
} from 'lucide-react';
import ChatbotWidget from '../components/widgets/ChatbotWidget';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [auxOpen, setAuxOpen] = useState(false);
  const [auxTab, setAuxTab] = useState('notes');
  const [notes, setNotes] = useState(() => localStorage.getItem('attorney_notes') || '');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [daysToAdd, setDaysToAdd] = useState(30);

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    localStorage.setItem('attorney_notes', val);
  };

  const calculatedDeadline = React.useMemo(() => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + parseInt(daysToAdd || 0));
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [startDate, daysToAdd]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Define sidebar links based on role
  const getNavLinks = () => {
    const common = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/cases', label: 'Cases', icon: Briefcase },
      { path: '/hearings', label: 'Hearing Calendar', icon: Calendar },
    ];

    if (user?.role === 'Admin') {
      return [
        ...common.slice(0, 1), // Dashboard
        { path: '/clients', label: 'Clients', icon: Users },
        common[1], // Cases
        { path: '/lawyers', label: 'Lawyers', icon: UserCog },
        common[2], // Hearings
      ];
    }

    return common;
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* --- Sidebar Desktop --- */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-primary text-white flex-shrink-0 border-r border-primary-dark shadow-xl">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center px-6 border-b border-blue-900/40">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <Scale className="h-7 w-7 text-accent" />
            <span className="text-xl font-bold tracking-wide">Coderlly Manage</span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-accent text-white font-medium shadow-md shadow-accent/25' 
                    : 'text-blue-100 hover:bg-blue-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'}`} />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className={`h-4 w-4 opacity-0 transition-opacity ${isActive ? 'opacity-100' : 'group-hover:opacity-40'}`} />
              </Link>
            );
          })}

          {/* Auxiliary Clipboard toggle button */}
          <button
            onClick={() => setAuxOpen(!auxOpen)}
            className={`flex w-full items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold text-blue-150 hover:bg-blue-900/40 hover:text-white mt-5 border border-dashed ${
              auxOpen ? 'border-accent bg-accent/15 text-white' : 'border-blue-900/40 text-blue-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Clipboard className="h-4.5 w-4.5" />
              <span>Utility Clipboard</span>
            </div>
            <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${auxOpen ? 'rotate-180' : ''}`} />
          </button>
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-blue-900/40 bg-primary-dark/30">
          <div className="flex items-center space-x-3 px-2 py-1 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent font-semibold text-sm border border-accent/30">
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs text-blue-200 truncate">{user?.role} Account</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-4 py-2.5 text-sm text-red-200 hover:text-white hover:bg-red-900/20 rounded-xl transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- Auxiliary Panel --- */}
      <div className={`hidden md:flex md:flex-col bg-white border-r border-slate-100 transition-all duration-300 overflow-hidden flex-shrink-0 ${auxOpen ? 'w-64' : 'w-0'}`}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Clipboard className="h-4.5 w-4.5 text-accent" />
            <span>Clipboard Board</span>
          </h3>
          <button 
            onClick={() => setAuxOpen(false)}
            className="h-7 w-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-150 text-xs font-semibold text-slate-500 bg-slate-50/50">
          <button 
            onClick={() => setAuxTab('notes')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${auxTab === 'notes' ? 'border-accent text-accent font-bold' : 'border-transparent hover:text-slate-700'}`}
          >
            Notepad
          </button>
          <button 
            onClick={() => setAuxTab('calculator')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${auxTab === 'calculator' ? 'border-accent text-accent font-bold' : 'border-transparent hover:text-slate-700'}`}
          >
            Deadline Calc
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {auxTab === 'notes' ? (
            <div className="h-full flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Consultation Notes</label>
              <textarea
                className="flex-1 w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-accent text-sm resize-none"
                placeholder="Jot down notes, client quotes, phone numbers, or active action plans..."
                value={notes}
                onChange={handleNotesChange}
              />
              <span className="text-[10px] text-slate-450 italic">Auto-saves to browser storage.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Legal Deadline Calculator</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Instantly project filing deadlines, response dates, or court terms.</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filing/Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-accent text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Term Limit (Days)</label>
                  <select 
                    value={daysToAdd}
                    onChange={e => setDaysToAdd(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-accent text-xs bg-white"
                  >
                    <option value={15}>15 Days</option>
                    <option value={30}>30 Days (Standard)</option>
                    <option value={45}>45 Days</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={120}>120 Days</option>
                  </select>
                </div>
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-3.5 mt-2">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-wider">Projected Deadline</p>
                  <p className="font-bold text-slate-800 dark:text-white mt-1 text-sm">{calculatedDeadline}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Sidebar Mobile Sheet --- */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Mobile Sidebar Content */}
          <div className="relative flex flex-col w-72 max-w-xs bg-primary text-white shadow-2xl animate-in slide-in-from-left duration-250">
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900/40 text-blue-100 hover:text-white focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex h-16 items-center px-6 border-b border-blue-900/40">
              <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center space-x-3">
                <Scale className="h-7 w-7 text-accent" />
                <span className="text-xl font-bold tracking-wide">Coderlly Manage</span>
              </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-accent text-white font-medium' 
                        : 'text-blue-100 hover:bg-blue-900/40 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-blue-900/40 bg-primary-dark/30">
              <div className="flex items-center space-x-3 px-2 py-1 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent font-semibold text-sm">
                  {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
                  <p className="text-xs text-blue-200 truncate">{user?.role} Account</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center space-x-3 px-4 py-2.5 text-sm text-red-200 hover:text-white hover:bg-red-900/20 rounded-xl transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Main App Container --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-6 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-4">
            {/* Sidebar toggle button (Mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/50"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Search form */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center">
              <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Global Search cases, clients, lawyers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-slate-50 focus:bg-white transition-all duration-200"
              />
            </form>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/50 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications Button */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/50 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-white"></span>
            </button>

            {/* User Profile Badge (Right-aligned) */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200/60">
              <div className="hidden text-right lg:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  user?.role === 'Admin' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {user?.role}
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-inner shadow-black/10">
                {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Main scrollable viewport */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-slate-50 p-6">
          <Outlet />
        </main>

        {/* Floating AI Chatbot Assistant */}
        <ChatbotWidget />
      </div>
    </div>
  );
};

export default DashboardLayout;
