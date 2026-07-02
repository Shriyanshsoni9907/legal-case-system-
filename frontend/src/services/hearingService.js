import API from './api';

const hearingService = {
  async getHearings(caseId = null) {
    const url = caseId ? `/hearings?caseId=${caseId}` : '/hearings';
    const response = await API.get(url);
    return response.data;
  },
  async getUpcomingHearings(limit = 10) {
    const response = await API.get(`/hearings/upcoming?limit=${limit}`);
    return response.data;
  },
  async createHearing(data) {
    const response = await API.post('/hearings', data);
    return response.data;
  },
  async updateHearing(id, data) {
    const response = await API.put(`/hearings/${id}`, data);
    return response.data;
  },
  async deleteHearing(id) {
    const response = await API.delete(`/hearings/${id}`);
    return response.data;
  },
};

export default hearingService;
