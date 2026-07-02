import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import clientService from '../../services/clientService';
import { X, User, Phone, Mail, MapPin, FileText, AlertCircle } from 'lucide-react';

const ClientForm = ({ isOpen, onClose, onSuccess, client = null }) => {
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const isEditMode = !!client;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    }
  });

  // Reset form with client data when opening in edit mode, or clear it for create mode
  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      if (client) {
        reset({
          name: client.name || '',
          phone: client.phone || '',
          email: client.email || '',
          address: client.address || '',
          notes: client.notes || '',
        });
      } else {
        reset({
          name: '',
          phone: '',
          email: '',
          address: '',
          notes: '',
        });
      }
    }
  }, [isOpen, client, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setApiError(null);
    setSubmitting(true);
    try {
      if (isEditMode) {
        await clientService.updateClient(client.id, data);
      } else {
        await clientService.createClient(data);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save client data. Please check inputs.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-10 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {isEditMode ? 'Edit Client Profile' : 'Add New Client'}
          </h3>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-200/60 text-slate-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {apiError && (
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-red-50 border border-red-150 text-red-700 text-xs">
              <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Client Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-slate-200 focus:border-accent focus:ring-accent'
                }`}
                placeholder="e.g. Acme Corp or Jane Doe"
                {...register('name', { required: 'Client name is required.' })}
              />
            </div>
            {errors.name && <p className="text-xs text-red-505">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${
                    errors.phone 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-slate-200 focus:border-accent focus:ring-accent'
                  }`}
                  placeholder="e.g. 555-0100"
                  {...register('phone', { required: 'Phone number is required.' })}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-505">{errors.phone.message}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-slate-200 focus:border-accent focus:ring-accent'
                  }`}
                  placeholder="e.g. contact@domain.com"
                  {...register('email', { 
                    required: 'Email address is required.',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address.'
                    }
                  })}
                />
              </div>
              {errors.email && <p className="text-xs text-red-505">{errors.email.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Mailing Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                rows={2}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                placeholder="Street address, Suite, City, State, ZIP"
                {...register('address')}
              ></textarea>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Client Notes & History</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                rows={3}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                placeholder="Relevant notes, billing conditions, or consultation history..."
                {...register('notes')}
              ></textarea>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-semibold border border-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/15 transition-colors disabled:opacity-75 disabled:cursor-wait"
            >
              {submitting ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
