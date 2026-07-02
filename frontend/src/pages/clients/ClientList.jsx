import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clientService from '../../services/clientService';
import { useAuth } from '../../context/AuthContext';
import ClientForm from './ClientForm';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

const ClientList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientService.getClients(query);
      setClients(data.data.clients);
    } catch (err) {
      setError('Could not retrieve client profiles. Please check server connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(search);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchClients(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    fetchClients('');
  };

  const handleAddClick = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleEditClick = (client, e) => {
    e.stopPropagation(); // Avoid navigating to details
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleDeleteClick = async (id, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete the client "${name}"? This action cannot be undone.`)) {
      try {
        await clientService.deleteClient(id);
        fetchClients(search);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete client.');
      }
    }
  };

  const handleRowClick = (id) => {
    navigate(`/clients/${id}`);
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="h-8 w-8 text-primary" />
            Client Directory
          </h1>
          <p className="text-slate-500 mt-1">Search, register, and update client records.</p>
        </div>
        
        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/25 transition-all duration-150"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-slate-50 focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
        <button
          onClick={() => fetchClients(search)}
          className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Search
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-sm font-semibold text-slate-500">Loading client profiles...</p>
          </div>
        </div>
      ) : error ? (
        // Error state
        <div className="flex items-center space-x-3 p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Error Loading Clients</p>
            <p className="text-xs text-red-650 mt-0.5">{error}</p>
          </div>
        </div>
      ) : clients.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-100 rounded-2xl shadow-sm min-h-[30vh]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 mb-4 border border-slate-200/50">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Clients Found</h3>
          <p className="text-slate-500 max-w-sm mt-1 text-sm">
            {search 
              ? 'No client records match your search criteria. Try checking the spellings or clear filters.' 
              : 'The client directory is currently empty. Get started by registering your first client.'}
          </p>
          {search && (
            <button
              onClick={handleClearSearch}
              className="mt-4 px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        // Client Directory List
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {clients.map((client) => (
                  <tr 
                    key={client.id}
                    onClick={() => handleRowClick(client.id)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors duration-150"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {client.name}
                    </td>
                    
                    {/* Phone */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {client.phone}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {client.email}
                      </span>
                    </td>

                    {/* Location / Address preview */}
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{client.address || 'Not specified'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRowClick(client.id); }}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Client Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleEditClick(client, e)}
                          className="p-2 text-slate-500 hover:text-accent hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Client"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        
                        {isAdmin && (
                          <button
                            onClick={(e) => handleDeleteClick(client.id, client.name, e)}
                            className="p-2 text-slate-550 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Client"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      <ClientForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchClients(search)}
        client={editingClient}
      />
    </div>
  );
};

export default ClientList;
