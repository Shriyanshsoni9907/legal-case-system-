import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import lawyerService from '../../services/lawyerService';
import { useAuth } from '../../context/AuthContext';
import LawyerForm from './LawyerForm';
import { Plus, UserCog, Mail, Phone, Briefcase, Edit3, Trash2, Eye, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const LawyerList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState(null);
  const isAdmin = user?.role === 'Admin';

  const fetchLawyers = async () => {
    setLoading(true); setError(null);
    try {
      const data = await lawyerService.getLawyers();
      setLawyers(data.data.lawyers);
    } catch (err) { setError('Could not load lawyer profiles.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLawyers(); }, []);

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Permanently remove lawyer "${name}"?`)) {
      try { await lawyerService.deleteLawyer(id); fetchLawyers(); }
      catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
    }
  };

  const statusBadge = (status) => status === 'Active'
    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="h-3 w-3" />Active</span>
    : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200"><XCircle className="h-3 w-3" />Suspended</span>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5"><UserCog className="h-8 w-8 text-primary" />Lawyer Directory</h1>
          <p className="text-slate-500 mt-1">Manage firm attorneys and their case assignments.</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingLawyer(null); setModalOpen(true); }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/25 transition-all">
            <Plus className="h-4.5 w-4.5" /><span>Add Lawyer</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center space-y-3"><Loader2 className="h-10 w-10 animate-spin text-accent" /><p className="text-sm font-semibold text-slate-500">Loading lawyers...</p></div>
        </div>
      ) : error ? (
        <div className="flex items-center space-x-3 p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700">
          <AlertCircle className="h-6 w-6 flex-shrink-0" /><p className="text-sm font-semibold">{error}</p>
        </div>
      ) : lawyers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <UserCog className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Lawyers Registered</h3>
          <p className="text-slate-500 text-sm mt-1">{isAdmin ? 'Register your first attorney to get started.' : 'No lawyer profiles are available.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in">
          {lawyers.map((lawyer, idx) => (
            <div key={lawyer.id} onClick={() => navigate(`/lawyers/${lawyer.id}`)}
              className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm cursor-pointer transition-card group animate-slide-up stagger-${(idx % 5) + 1} opacity-0`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg border border-primary/10 transition-transform duration-300 group-hover:scale-105">
                    {lawyer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{lawyer.name}</h3>
                    {statusBadge(lawyer.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-slate-600 mb-5">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">{lawyer.email}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /><span>{lawyer.phone || 'Not provided'}</span></div>
                <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">{lawyer.specialization || 'General Practice'}</span></div>
              </div>

              <div className="flex items-center justify-end border-t border-slate-100 pt-4 gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => navigate(`/lawyers/${lawyer.id}`)} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                {isAdmin && (<>
                  <button onClick={() => { setEditingLawyer(lawyer); setModalOpen(true); }} className="p-2 text-slate-500 hover:text-accent hover:bg-slate-100 rounded-lg transition-colors" title="Edit"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={(e) => handleDelete(lawyer.id, lawyer.name, e)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </>)}
              </div>
            </div>
          ))}
        </div>
      )}

      <LawyerForm isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchLawyers} lawyer={editingLawyer} />
    </div>
  );
};

export default LawyerList;
