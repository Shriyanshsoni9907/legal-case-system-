import API from './api';

const clientService = {
  // Retrieve list of all clients, with optional search query
  async getClients(searchQuery = '') {
    const response = await API.get(`/clients?q=${encodeURIComponent(searchQuery)}`);
    return response.data;
  },

  // Retrieve details for a single client
  async getClient(id) {
    const response = await API.get(`/clients/${id}`);
    return response.data;
  },

  // Create new client record
  async createClient(clientData) {
    const response = await API.post('/clients', clientData);
    return response.data;
  },

  // Update existing client record
  async updateClient(id, clientData) {
    const response = await API.put(`/clients/${id}`, clientData);
    return response.data;
  },

  // Delete client record (Admin only)
  async deleteClient(id) {
    const response = await API.delete(`/clients/${id}`);
    return response.data;
  },
};

export default clientService;
