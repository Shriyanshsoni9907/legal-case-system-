import API from './api';

const documentService = {
  async getDocuments(caseId) {
    const response = await API.get(`/cases/${caseId}/documents`);
    return response.data;
  },
  async uploadDocument(caseId, file) {
    const formData = new FormData();
    formData.append('document', file);
    const response = await API.post(`/cases/${caseId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  async deleteDocument(caseId, docId) {
    const response = await API.delete(`/cases/${caseId}/documents/${docId}`);
    return response.data;
  },
  getDownloadUrl(caseId, docId) {
    return `${API.defaults.baseURL}/cases/${caseId}/documents/${docId}`;
  },
};

export default documentService;
