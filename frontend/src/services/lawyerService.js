import API from './api';

const lawyerService = {
  // Retrieve list of all lawyers in the firm
  async getLawyers() {
    const response = await API.get('/lawyers');
    return response.data;
  },

  // Retrieve details for a single lawyer
  async getLawyer(id) {
    const response = await API.get(`/lawyers/${id}`);
    return response.data;
  },

  // Register a new lawyer user and profile details (Admin only)
  async createLawyer(lawyerData) {
    const response = await API.post('/lawyers', lawyerData);
    return response.data;
  },

  // Update existing lawyer profile fields (Admin only)
  async updateLawyer(id, lawyerData) {
    const response = await API.put(`/lawyers/${id}`, lawyerData);
    return response.data;
  },

  // Remove lawyer profile and account (Admin only)
  async deleteLawyer(id) {
    const response = await API.delete(`/lawyers/${id}`);
    return response.data;
  },
};

export default lawyerService;
