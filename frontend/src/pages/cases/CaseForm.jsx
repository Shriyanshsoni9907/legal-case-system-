import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import caseService from '../../services/caseService';
import clientService from '../../services/clientService';
import lawyerService from '../../services/lawyerService';
import { useAuth } from '../../context/AuthContext';
import { X, AlertCircle, Briefcase, Hash, Scale, Building2, Calendar } from 'lucide-react';

const CASE_TYPES = ['Civil', 'Criminal', 'Corporate', 'Family', 'Property', 'Intellectual Property', 'Tax', 'Labour', 'Other'];
const CASE_STATUSES = ['Pending', 'Active', 'Closed', 'On Hold'];

const CaseForm = ({ isOpen, onClose, onSuccess, caseData = null }) => {
  const { user } = useAuth();
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const isEdit = !!caseData;
  const isAdmin = user?.role === 'Admin';

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      Promise.all([clientService.getClients(), lawyerService.getLawyers()]).then(([c, l]) => {
        setClients(c.data.clients);
        setLawyers(l.data.lawyers);
      });
      reset(isEdit ? {
        caseTitle: caseData.case_title, caseNumber: caseData.case_number, caseType: caseData.case_type,
        court: caseData.court, status: caseData.status, filingDate: caseData.filing_date?.split('T')[0],
        hearingDate: caseData.hearing_date?.split('T')[0] || '', clientId: caseData.client_id,
        lawyerId: caseData.lawyer_id || '', description: caseData.description || '',
      } : { status: 'Pending', caseType: 'Civil' });
    }
  }, [isOpen, caseData]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setApiError(null); setSubmitting(true);
    try {
      if (isEdit) await caseService.updateCase(caseData.id, data);
      else await caseService.createCase(data);
      onSuccess(); onClose();
    } catch (err) { setApiError(err.response?.data?.message || 'Failed to save case.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-2xl z-10 overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />{isEdit ? 'Edit Case' : 'Create New Case'}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {apiError && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs"><AlertCircle className="h-4 w-4 flex-shrink-0" /><span>{apiError}</span></div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Case Title *</label>
              <div className="relative"><Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${errors.caseTitle ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                  placeholder="e.g. Acme Corp vs. Smith Industries" {...register('caseTitle', { required: 'Case title is required.' })} />
              </div>
              {errors.caseTitle && <p className="text-xs text-red-500">{errors.caseTitle.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Case Number *</label>
              <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${errors.caseNumber ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                  placeholder="e.g. CIV-2026-001" {...register('caseNumber', { required: 'Case number is required.' })} />
              </div>
              {errors.caseNumber && <p className="text-xs text-red-500">{errors.caseNumber.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Case Type *</label>
              <select className="w-full px-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                {...register('caseType', { required: true })}>
                {CASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Court *</label>
              <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${errors.court ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                  placeholder="e.g. District Court Mumbai" {...register('court', { required: 'Court name is required.' })} />
              </div>
              {errors.court && <p className="text-xs text-red-500">{errors.court.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</label>
              <select className="w-full px-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white" {...register('status')}>
                {CASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Filing Date *</label>
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="date" className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${errors.filingDate ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                  {...register('filingDate', { required: 'Filing date is required.' })} />
              </div>
              {errors.filingDate && <p className="text-xs text-red-500">{errors.filingDate.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Next Hearing Date</label>
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="date" className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  {...register('hearingDate')} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Client *</label>
              <select className={`w-full px-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 bg-white ${errors.clientId ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                {...register('clientId', { required: 'Client is required.' })}>
                <option value="">— Select Client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned Lawyer</label>
              <select className="w-full px-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                {...register('lawyerId')}>
                <option value="">— Unassigned —</option>
                {lawyers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Case Description</label>
              <textarea rows={3} className="w-full px-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                placeholder="Brief summary of the legal matter, parties involved, and background..." {...register('description')} />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold border border-slate-200">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/15 disabled:opacity-75">
              {submitting ? 'Saving...' : isEdit ? 'Update Case' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseForm;
