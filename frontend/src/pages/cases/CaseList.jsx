import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import caseService from '../../services/caseService';
import { useAuth } from '../../context/AuthContext';
import CaseForm from './CaseForm';
import { Plus, Briefcase, Search, X, Loader2, AlertCircle, Edit3, Trash2, Eye, ChevronDown } from 'lucide-react';

const STATUS_COLORS = {
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Active: 'bg-green-50 text-green-700 border-green-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
  'On Hold': 'bg-orange-50 text-orange-700 border-orange-200',
};

const CaseList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ q: '', status: '', court: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const isAdmin = user?.role === 'Admin';

  const fetchCases = async () => {
    setLoading(true); setError(null);
    try {
      const data = await caseService.getCases(filters);
      setCases(data.data.cases);
    } catch (err) { setError('Could not load cases.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCases(); }, []);

  const handleDelete = async (id, title, e) => {
    e.stopPropagation();
    if (window.confirm(`Permanently delete case "${title}"?`)) {
      try { await caseService.deleteCase(id); fetchCases(); }
      catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5"><Briefcase className="h-8 w-8 text-primary" />Case Management</h1>
          <p className="text-slate-500 mt-1">Track, filter, and manage all legal cases.</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingCase(null); setModalOpen(true); }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/25 transition-all">
            <Plus className="h-4.5 w-4.5" /><span>New Case</span>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search title or case number..." value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-slate-50 focus:bg-white" />
        </div>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-accent bg-white">
          <option value="">All Statuses</option>
          {['Pending','Active','Closed','On Hold'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="text" placeholder="Filter by court..." value={filters.court}
          onChange={e => setFilters(f => ({ ...f, court: e.target.value }))}
          className="px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white" />
        <button onClick={fetchCases} className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors">Apply</button>
        {(filters.q || filters.status || filters.court) && (
          <button onClick={() => { setFilters({ q: '', status: '', court: '' }); }} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-600 flex items-center gap-1.5">
            <X className="h-3.5 w-3.5" />Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>
      ) : error ? (
        <div className="flex items-center gap-3 p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700"><AlertCircle className="h-6 w-6" /><p className="text-sm font-semibold">{error}</p></div>
      ) : cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <Briefcase className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Cases Found</h3>
          <p className="text-slate-500 text-sm mt-1">{isAdmin ? 'Create your first case to get started.' : 'No cases are currently assigned to you.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Case</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Lawyer</th>
                  <th className="px-6 py-4">Filing Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cases.map(c => (
                  <tr key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="hover:bg-slate-50/70 cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{c.case_title}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{c.case_number}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{c.case_type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{c.client_name || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{c.lawyer_name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                    <td className="px-6 py-4 text-slate-500">{c.filing_date ? new Date(c.filing_date).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => navigate(`/cases/${c.id}`)} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg" title="View"><Eye className="h-4 w-4" /></button>
                        {isAdmin && <>
                          <button onClick={() => { setEditingCase(c); setModalOpen(true); }} className="p-2 text-slate-500 hover:text-accent hover:bg-slate-100 rounded-lg" title="Edit"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={(e) => handleDelete(c.id, c.case_title, e)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CaseForm isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchCases} caseData={editingCase} />
    </div>
  );
};

export default CaseList;
