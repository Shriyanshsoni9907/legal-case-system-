import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import hearingService from '../../services/hearingService';
import caseService from '../../services/caseService';
import { Calendar, Plus, Edit3, Trash2, Loader2, X, AlertCircle, Gavel, Building2 } from 'lucide-react';

const HearingForm = ({ isOpen, onClose, onSuccess, hearing = null }) => {
  const [cases, setCases] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const isEdit = !!hearing;

  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      caseService.getCases().then(d => setCases(d.data.cases));
      reset(isEdit ? {
        caseId: hearing.case_id,
        hearingDate: new Date(hearing.hearing_date).toISOString().slice(0, 16),
        court: hearing.court, judge: hearing.judge, description: hearing.description || '',
      } : {});
    }
  }, [isOpen, hearing]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setApiError(null); setSubmitting(true);
    try {
      if (isEdit) await hearingService.updateHearing(hearing.id, data);
      else await hearingService.createHearing(data);
      onSuccess(); onClose();
    } catch (err) { setApiError(err.response?.data?.message || 'Failed to save hearing.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl z-10 overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />{isEdit ? 'Edit Hearing' : 'Schedule Hearing'}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {apiError && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs"><AlertCircle className="h-4 w-4 flex-shrink-0" /><span>{apiError}</span></div>}

          {!isEdit && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Related Case *</label>
              <select className={`w-full px-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 bg-white ${errors.caseId ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                {...register('caseId', { required: 'Case is required.' })}>
                <option value="">— Select Case —</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.case_title} ({c.case_number})</option>)}
              </select>
              {errors.caseId && <p className="text-xs text-red-500">{errors.caseId.message}</p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Hearing Date & Time *</label>
            <input type="datetime-local" className={`w-full px-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${errors.hearingDate ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
              {...register('hearingDate', { required: 'Hearing date is required.' })} />
            {errors.hearingDate && <p className="text-xs text-red-500">{errors.hearingDate.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Court *</label>
              <div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Court name" className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${errors.court ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                  {...register('court', { required: 'Court is required.' })} />
              </div>
              {errors.court && <p className="text-xs text-red-500">{errors.court.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Judge *</label>
              <div className="relative"><Gavel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Hon. Judge name" className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${errors.judge ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                  {...register('judge', { required: 'Judge is required.' })} />
              </div>
              {errors.judge && <p className="text-xs text-red-500">{errors.judge.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Notes</label>
            <textarea rows={2} className="w-full px-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none" placeholder="Additional hearing notes..." {...register('description')} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold border border-slate-200">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/15 disabled:opacity-75">
              {submitting ? 'Saving...' : isEdit ? 'Update Hearing' : 'Schedule Hearing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HearingCalendar = () => {
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHearing, setEditingHearing] = useState(null);

  const fetchHearings = async () => {
    setLoading(true);
    try { const d = await hearingService.getHearings(); setHearings(d.data.hearings); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHearings(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this hearing?')) {
      try { await hearingService.deleteHearing(id); fetchHearings(); }
      catch (err) { alert('Delete failed.'); }
    }
  };

  const isPast = (date) => new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5"><Calendar className="h-8 w-8 text-primary" />Hearing Calendar</h1>
          <p className="text-slate-500 mt-1">Schedule and track all court hearings.</p>
        </div>
        <button onClick={() => { setEditingHearing(null); setModalOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/25 transition-all">
          <Plus className="h-4.5 w-4.5" />Schedule Hearing
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>
      ) : hearings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <Calendar className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Hearings Scheduled</h3>
          <p className="text-slate-500 text-sm mt-1">Schedule a court hearing to get started.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {['Upcoming', 'Past'].map((section, sIdx) => {
            const filtered = section === 'Upcoming' ? hearings.filter(h => !isPast(h.hearing_date)) : hearings.filter(h => isPast(h.hearing_date));
            if (filtered.length === 0) return null;
            return (
              <div key={section} className="animate-slide-up stagger-1">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{section} Hearings</h2>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {filtered.map((h, hIdx) => (
                    <div key={h.id} className={`flex items-start gap-5 p-5 hover:bg-slate-50/60 transition-colors animate-slide-up stagger-${(hIdx % 4) + 1} ${isPast(h.hearing_date) ? 'opacity-60' : ''}`}>
                      <div className={`flex-shrink-0 flex flex-col items-center justify-center rounded-xl p-3 min-w-16 text-center ${isPast(h.hearing_date) ? 'bg-slate-100 text-slate-500' : 'bg-primary/10 text-primary'}`}>
                        <span className="text-xs font-bold uppercase">{new Date(h.hearing_date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-2xl font-extrabold">{new Date(h.hearing_date).getDate()}</span>
                        <span className="text-xs">{new Date(h.hearing_date).getFullYear()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900">{h.case_title || 'Unknown Case'}</p>
                        <p className="text-xs text-slate-400 font-mono">{h.case_number}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" />{h.court}</span>
                          <span className="flex items-center gap-1.5"><Gavel className="h-3.5 w-3.5 text-slate-400" />{h.judge}</span>
                          <span className="text-slate-400">{new Date(h.hearing_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {h.description && <p className="text-xs text-slate-500 mt-1.5 italic">{h.description}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => { setEditingHearing(h); setModalOpen(true); }} className="p-2 text-slate-500 hover:text-accent hover:bg-slate-100 rounded-lg"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(h.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HearingForm isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchHearings} hearing={editingHearing} />
    </div>
  );
};

export default HearingCalendar;
