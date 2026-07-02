import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    setApiError(null);
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign In</h2>
        <p className="text-sm text-slate-500">Access your legal case management dashboard</p>
      </div>

      {/* Error Alert Box */}
      {apiError && (
        <div className="flex items-start space-x-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Authentication Error</p>
            <p className="mt-0.5 text-red-600">{apiError}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="e.g. attorney@firm.com"
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
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
          </div>
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
              placeholder="••••••••"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/20 focus:outline-none transition-colors duration-150 disabled:opacity-75 disabled:cursor-wait"
        >
          {submitting ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* Signup Link */}
      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-accent hover:text-accent-hover">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
