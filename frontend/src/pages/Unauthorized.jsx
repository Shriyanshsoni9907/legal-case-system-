import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm mb-6">
        <ShieldX className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Access Restricted</h1>
      <p className="text-slate-500 max-w-md mb-8">
        Your account level does not have clearance to view this module. If you believe this is an error, please reach out to your firm's administrator.
      </p>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold shadow-md shadow-primary/20 transition-all focus:outline-none"
      >
        Go Back to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
// Exporting default
