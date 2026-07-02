import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Title, Filler
} from 'chart.js';
import { Briefcase, Users, UserCog, Calendar, TrendingUp, Scale, ArrowRight, Clock, Loader2 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

const StatCard = ({ icon: Icon, label, value, color, href, className = "" }) => (
  <Link to={href || '#'} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 transition-card group ${className}`}>
    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${color} transition-transform duration-350 group-hover:scale-110`}>
      <Icon className="h-7 w-7" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{value}</p>
    </div>
    <ArrowRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    API.get('/analytics/dashboard').then(r => setStats(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-sm font-semibold text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statusColors = { Pending: '#F59E0B', Active: '#10B981', Closed: '#94A3B8', 'On Hold': '#F97316' };
  const casesByStatusData = stats?.casesByStatus ? {
    labels: stats.casesByStatus.map(s => s.status),
    datasets: [{
      data: stats.casesByStatus.map(s => parseInt(s.count)),
      backgroundColor: stats.casesByStatus.map(s => statusColors[s.status] || '#6366F1'),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  } : null;

  const casesByMonthData = stats?.casesByMonth ? {
    labels: stats.casesByMonth.map(m => m.month),
    datasets: [{
      label: 'Cases Filed',
      data: stats.casesByMonth.map(m => parseInt(m.count)),
      backgroundColor: 'rgba(37,99,235,0.12)',
      borderColor: '#2563EB',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#2563EB',
      pointRadius: 4,
    }],
  } : null;

  const lawyerCasesData = stats?.casesByLawyer?.length ? {
    labels: stats.casesByLawyer.map(l => l.lawyer_name),
    datasets: [{
      label: 'Assigned Cases',
      data: stats.casesByLawyer.map(l => parseInt(l.count)),
      backgroundColor: '#1E3A8A',
      borderRadius: 8,
      barThickness: 28,
    }],
  } : null;

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  const doughnutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { padding: 16, usePointStyle: true } } }, cutout: '72%' };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-7 text-white shadow-lg shadow-primary/20 relative overflow-hidden animate-slide-up">
        <div className="absolute inset-0 opacity-10"><div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white"></div><div className="absolute -left-8 -bottom-16 h-48 w-48 rounded-full bg-white"></div></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2"><Scale className="h-7 w-7" /><span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">{user?.role} Dashboard</span></div>
          <h1 className="text-2xl font-extrabold mt-1">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-blue-100 mt-1 text-sm">Here's your practice overview as of {new Date().toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric' })}.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={Briefcase} label="Total Cases" value={stats?.totalCases ?? 0} color="bg-blue-50 text-blue-600" href="/cases" className="animate-slide-up stagger-1 opacity-0" />
        {isAdmin && <StatCard icon={Users} label="Total Clients" value={stats?.totalClients ?? 0} color="bg-purple-50 text-purple-600" href="/clients" className="animate-slide-up stagger-2 opacity-0" />}
        {isAdmin && <StatCard icon={UserCog} label="Total Lawyers" value={stats?.totalLawyers ?? 0} color="bg-indigo-50 text-indigo-600" href="/lawyers" className="animate-slide-up stagger-3 opacity-0" />}
        <StatCard icon={Calendar} label="Upcoming Hearings" value={stats?.upcomingHearingsCount ?? 0} color="bg-amber-50 text-amber-600" href="/hearings" className="animate-slide-up stagger-4 opacity-0" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up stagger-3 opacity-0">
        {/* Case Status Doughnut */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-card">
          <h3 className="font-bold text-slate-800 mb-1">Cases by Status</h3>
          <p className="text-xs text-slate-400 mb-5">Distribution of active, pending, and closed cases.</p>
          <div className="h-52">
            {casesByStatusData && casesByStatusData.datasets[0].data.some(v => v > 0)
              ? <Doughnut data={casesByStatusData} options={doughnutOpts} />
              : <div className="flex items-center justify-center h-full text-slate-400 text-sm">No case data yet</div>}
          </div>
        </div>

        {/* Cases by Month Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-card">
          <h3 className="font-bold text-slate-800 mb-1">Case Filing Trends</h3>
          <p className="text-xs text-slate-400 mb-5">New cases filed over the last 6 months.</p>
          <div className="h-52">
            {casesByMonthData
              ? <Line data={casesByMonthData} options={{ ...chartOpts, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }} />
              : <div className="flex items-center justify-center h-full text-slate-400 text-sm">No monthly data yet</div>}
          </div>
        </div>
      </div>

      {/* Lawyers Bar + Upcoming Hearings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-slide-up stagger-4 opacity-0">
        {/* Cases by Lawyer */}
        {isAdmin && (
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-card">
            <h3 className="font-bold text-slate-800 mb-1">Cases per Lawyer</h3>
            <p className="text-xs text-slate-400 mb-5">Workload distribution across attorneys.</p>
            <div className="h-52">
              {lawyerCasesData && lawyerCasesData.datasets[0].data.some(v => v > 0)
                ? <Bar data={lawyerCasesData} options={{ ...chartOpts, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }} />
                : <div className="flex items-center justify-center h-full text-slate-400 text-sm">No lawyer assignment data</div>}
            </div>
          </div>
        )}

        {/* Upcoming Hearings Widget */}
        <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-5'} bg-white rounded-2xl border border-slate-100 shadow-sm p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div><h3 className="font-bold text-slate-800">Upcoming Hearings</h3><p className="text-xs text-slate-400">Next scheduled court dates</p></div>
            <Link to="/hearings" className="text-xs font-bold text-accent hover:text-accent-hover flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {!stats?.upcomingHearings?.length ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-8 w-8 text-slate-300 mb-2" /><p className="text-sm text-slate-500">No upcoming hearings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.upcomingHearings.map(h => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-center">
                    <span className="text-xs font-bold">{new Date(h.hearing_date).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{h.case_title}</p>
                    <p className="text-xs text-slate-400">{new Date(h.hearing_date).toLocaleDateString('en-IN', { month:'short', day:'numeric' })} · {h.court}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
