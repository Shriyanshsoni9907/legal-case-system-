import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clientService from '../../services/clientService';
import { useAuth } from '../../context/AuthContext';
import ClientForm from './ClientForm';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Edit3, 
  Trash2, 
  Briefcase, 
  Calendar,
  AlertCircle,
  Loader2,
  Scale
} from 'lucide-react';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal toggle state
  const [formOpen, setFormOpen] = useState(false);
  const [mockCases, setMockCases] = useState([]); // Placeholder cases linked to this client

  const fetchClientDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getClient(id);
      setClient(data.data.client);
      
      // Fetch mock cases (will connect to backend case API in Phase 5)
      // For now, let's show an empty array or a simple placeholder
      setMockCases([]);
    } catch (err) {
      setError('Could not retrieve client details. The client might have been deleted.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete the client "${client.name}"? This action cannot be undone.`)) {
      try {
        await clientService.deleteClient(client.id);
        navigate('/clients');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete client.');
      }
    }
  };

  const isAdmin = user?.role === 'Admin';

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-sm font-semibold text-slate-500">Loading client file...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Client Directory</span>
        </button>
        <div className="flex items-center space-x-3 p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700">
          <AlertCircle className="h-6 w-6 text-red-650 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Error Loading Profile</p>
            <p className="text-xs mt-0.5">{error || 'Client details not found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-950 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
          
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold border border-red-200/50 shadow-sm transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 text-primary border border-primary/10 mb-4 font-bold text-2xl">
              {client.name.split(' ').map(n=>n[0]).join('')}
            </div>
            
            <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
            <span className="text-xs text-slate-400 font-medium mt-0.5">Client Record ID: {client.id.slice(0, 8)}...</span>

            <div className="w-full border-t border-slate-100 my-6"></div>

            {/* Profile Contact List */}
            <div className="w-full space-y-4 text-left text-sm text-slate-700">
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Phone Number</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{client.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Email Address</p>
                  <p className="font-semibold text-slate-800 mt-0.5 break-all">{client.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mailing Address</p>
                  <p className="font-semibold text-slate-850 mt-0.5 leading-relaxed">
                    {client.address || 'No address specified.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Notes & Associated Cases */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notes Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-400" />
              Client File Notes
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/40 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
              {client.notes ? client.notes : 'No administrative notes recorded for this client.'}
            </div>
          </div>

          {/* Associated Cases list placeholder */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-slate-400" />
                Associated Legal Cases
              </h3>
              
              {isAdmin && (
                <Link
                  to="/cases"
                  className="text-xs font-bold text-accent hover:text-accent-hover flex items-center gap-1"
                >
                  <Scale className="h-3.5 w-3.5" />
                  Assign New Case
                </Link>
              )}
            </div>

            {mockCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                <Briefcase className="h-8 w-8 text-slate-350 mb-2" />
                <h4 className="text-sm font-semibold text-slate-800">No Associated Cases</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-0.5">
                  This client does not currently have any active or closed cases registered in the system.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Cases table will go here in Phase 5 */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <ClientForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchClientDetails}
        client={client}
      />
    </div>
  );
};

export default ClientDetails;
