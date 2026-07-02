import API from './api';

const caseService = {
  async getCases(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const response = await API.get(`/cases?${params.toString()}`);
    return response.data;
  },
  async getCase(id) {
    const response = await API.get(`/cases/${id}`);
    return response.data;
  },
  async createCase(data) {
    const response = await API.post('/cases', data);
    return response.data;
  },
  async updateCase(id, data) {
    const response = await API.put(`/cases/${id}`, data);
    return response.data;
  },
  async deleteCase(id) {
    const response = await API.delete(`/cases/${id}`);
    return response.data;
  },
};

export default caseService;
