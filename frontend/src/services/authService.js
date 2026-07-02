import API from './api';

const authService = {
  // Login user and persist token
  async login(email, password) {
    const response = await API.post('/auth/login', { email, password });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data.data;
  },

  // Register new user, persist token
  async signup(userData) {
    const response = await API.post('/auth/signup', userData);
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data.data;
  },

  // Fetch current user details
  async getMe() {
    const response = await API.get('/auth/me');
    return response.data.data;
  },

  // Logout by removing local storage credentials
  logout() {
    localStorage.removeItem('token');
  },
};

export default authService;
