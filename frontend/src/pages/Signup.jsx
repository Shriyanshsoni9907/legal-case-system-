import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ShieldAlert, Briefcase, Phone } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'Lawyer',
      phone: '',
      specialization: '',
    }
  });

  // Watch the role input to show additional fields dynamically
  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setApiError(null);
    setSubmitting(true);
    
    // Prepare payload
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    };

    if (data.role === 'Lawyer') {
      payload.phone = data.phone;
      payload.specialization = data.specialization;
    }

    try {
      await signup(payload);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your data.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Account</h2>
        <p className="text-sm text-slate-500">Register a new LexManage user account</p>
      </div>

      {/* Error Alert Box */}
      {apiError && (
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Registration Error</p>
            <p className="mt-0.5 text-red-600">{apiError}</p>
          </div>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              id="name"
              type="text"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 ${
                errors.name 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 focus:border-accent focus:ring-accent'
              }`}
              placeholder="e.g. Attorney John Doe"
              {...register('name', { required: 'Full name is required.' })}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              id="email"
              type="email"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 ${
                errors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 focus:border-accent focus:ring-accent'
              }`}
              placeholder="e.g. johndoe@firm.com"
              {...register('email', { 
                required: 'Email address is required.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address.'
                }
              })}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              id="password"
              type="password"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 ${
                errors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : 'border-slate-200 focus:border-accent focus:ring-accent'
              }`}
              placeholder="Min. 6 characters"
              {...register('password', { 
                required: 'Password is required.',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters.'
                }
              })}
            />
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* User Role Selection */}
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-semibold text-slate-700">User Role</label>
          <select
            id="role"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            {...register('role', { required: 'Please select a user role.' })}
          >
            <option value="Lawyer">Lawyer (Access to assigned cases & filings)</option>
            <option value="Admin">Admin (Access to full firm configurations)</option>
          </select>
        </div>

        {/* Dynamic Lawyer Fields */}
        {selectedRole === 'Lawyer' && (
          <div className="space-y-4 pt-1 border-t border-slate-100 animate-in fade-in duration-200">
            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="phone"
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="e.g. 555-0199"
                  {...register('phone', { required: 'Phone number is required for Lawyers.' })}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Specialization */}
            <div className="space-y-1.5">
              <label htmlFor="specialization" className="text-sm font-semibold text-slate-700">Legal Specialization</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  id="specialization"
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="e.g. Corporate Law, Intellectual Property"
                  {...register('specialization', { required: 'Specialization is required for Lawyers.' })}
                />
              </div>
              {errors.specialization && <p className="text-xs text-red-500">{errors.specialization.message}</p>}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/20 focus:outline-none transition-colors duration-150 disabled:opacity-75 disabled:cursor-wait"
        >
          {submitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {/* Login Link */}
      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
