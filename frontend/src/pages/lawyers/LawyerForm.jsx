import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import lawyerService from '../../services/lawyerService';
import { X, User, Mail, Lock, Phone, Briefcase, AlertCircle } from 'lucide-react';

const LawyerForm = ({ isOpen, onClose, onSuccess, lawyer = null }) => {
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!lawyer;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', password: '', phone: '', specialization: '', status: 'Active' }
  });

  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      if (lawyer) {
        reset({ name: lawyer.name || '', email: lawyer.email || '', password: '', phone: lawyer.phone || '', specialization: lawyer.specialization || '', status: lawyer.status || 'Active' });
      } else {
        reset({ name: '', email: '', password: '', phone: '', specialization: '', status: 'Active' });
      }
    }
  }, [isOpen, lawyer, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setApiError(null);
    setSubmitting(true);
    try {
      if (isEditMode) {
        const { password, email, ...updateData } = data;
        await lawyerService.updateLawyer(lawyer.id, updateData);
      } else {
        await lawyerService.createLawyer(data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to save lawyer data.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl z-10 overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{isEditMode ? 'Edit Lawyer Profile' : 'Register New Lawyer'}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200/60 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {apiError && (
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Attorney Jane Smith" className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                  {...register('name', { required: 'Full name is required.' })} />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="email" placeholder="jane@firm.com" disabled={isEditMode} className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400 ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                  {...register('email', { required: !isEditMode ? 'Email is required.' : false, pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email.' } })} />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          {!isEditMode && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="password" placeholder="Min. 6 characters" className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'}`}
                  {...register('password', { required: 'Password is required.', minLength: { value: 6, message: 'Min 6 characters.' } })} />
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="555-0199" className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  {...register('phone')} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</label>
              <select className="w-full px-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
                {...register('status')}>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Legal Specialization</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="e.g. Corporate Law, Criminal Defense" className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                {...register('specialization')} />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold border border-slate-200 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/15 transition-colors disabled:opacity-75">
              {submitting ? 'Saving...' : isEditMode ? 'Update Lawyer' : 'Register Lawyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LawyerForm;
