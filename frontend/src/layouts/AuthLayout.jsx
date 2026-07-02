import React from 'react';
import { Outlet } from 'react-router-dom';
import { Scale } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 flex-col lg:flex-row">
      {/* Left Banner Panel (Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-white flex-col justify-between p-16 relative overflow-hidden">
        {/* Gradient and glow effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark opacity-95 z-0"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl z-0"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl z-0"></div>
        
        {/* Branding header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent shadow-lg shadow-accent/30">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Coderlly Manage</span>
        </div>
        
        {/* Main message */}
        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight text-white lg:text-5xl">
            Enterprise Legal Practice Management.
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            A cohesive suite designed for legal experts to organize clients, tracks case filings, upload case documents, and structure upcoming hearing dates securely.
          </p>
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex -space-x-2">
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-primary bg-gray-600"></span>
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-primary bg-gray-500"></span>
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-primary bg-gray-400"></span>
            </div>
            <p className="text-sm font-medium text-gray-300">Trusted by top legal practitioners.</p>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="relative z-10 text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Coderlly Manage. Designed for premium legal practices.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 lg:w-1/2">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-xl shadow-slate-100/50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
