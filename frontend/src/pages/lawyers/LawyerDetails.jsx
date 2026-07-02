import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import lawyerService from '../../services/lawyerService';
import caseService from '../../services/caseService';
import { useAuth } from '../../context/AuthContext';
import LawyerForm from './LawyerForm';
import { ArrowLeft, Edit3, Trash2, Loader2, AlertCircle, UserCog, Mail, Phone, Briefcase, CheckCircle2, XCircle, Scale } from 'lucide-react';

const STATUS_COLORS = {
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Active: 'bg-green-50 text-green-700 border-green-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
  'On Hold': 'bg-orange-50 text-orange-700 border-orange-200',
};

const LawyerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lawyer, setLawyer] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const isAdmin = user?.role === 'Admin';

  const fetchLawyerDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const lawyerRes = await lawyerService.getLawyer(id);
      setLawyer(lawyerRes.data.lawyer);
      
      const casesRes = await caseService.getCases({ lawyerId: id });
      setCases(casesRes.data.cases);
    } catch (err) {
      setError('Could not retrieve lawyer details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyerDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Permanently remove lawyer "${lawyer.name}"?`)) {
      try {
        await lawyerService.deleteLawyer(lawyer.id);
        navigate('/lawyers');
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed.');
      }
    }
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>;
  
  if (error || !lawyer) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/lawyers')} className="flex items-center gap-2 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" />Back to Lawyers</button>
        <div className="flex items-center gap-3 p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700">
          <AlertCircle className="h-6 w-6" /><p className="text-sm">{error || 'Lawyer not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button onClick={() => navigate('/lawyers')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 font-medium"><ArrowLeft className="h-4 w-4" />Back to Directory</button>
        
        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <button onClick={() => setFormOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm"><Edit3 className="h-4 w-4" />Edit Profile</button>
            <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold border border-red-200"><Trash2 className="h-4 w-4" />Remove Lawyer</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 text-primary border border-primary/10 mb-4 font-bold text-2xl">
              {lawyer.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <h2 className="text-xl font-bold text-slate-900">{lawyer.name}</h2>
            <div className="mt-2">
              {lawyer.status === 'Active' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="h-3 w-3" />Active</span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200"><XCircle className="h-3 w-3" />Suspended</span>
              )}
            </div>

            <div className="w-full border-t border-slate-100 my-6"></div>

            <div className="w-full space-y-4 text-left text-sm text-slate-700">
              <div className="flex items-start space-x-3">
                <Briefcase className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Specialization</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{lawyer.specialization || 'General Practice'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Phone Number</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{lawyer.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email Address</p>
                  <p className="font-semibold text-slate-850 mt-0.5 break-all">{lawyer.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Cases */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="h-5 w-5 text-slate-400" />
              Assigned cases ({cases.length})
            </h3>

            {cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                <Briefcase className="h-8 w-8 text-slate-300 mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No Assigned Cases</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-0.5">This attorney does not have any active or closed case assignments.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cases.map(c => (
                  <div key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 px-2 rounded-xl cursor-pointer transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900">{c.case_title}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{c.case_number} · Client: {c.client_name}</p>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <LawyerForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSuccess={fetchLawyerDetails} lawyer={lawyer} />
    </div>
  );
};

export default LawyerDetails;
