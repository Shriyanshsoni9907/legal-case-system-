import API from './api';

const chatService = {
  /**
   * Send a query to the AI Legal Assistant Chatbot
   * @param {string} message - User query message
   * @returns {Promise<object>} Reply object
   */
  async sendMessage(message) {
    const response = await API.post('/chat', { message });
    return response.data;
  },
};

export default chatService;
