import axios from 'axios';

// Local backend URL where FastAPI is running
const API_BASE_URL = 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Register a new user with a baseline monthly footprint
   * @param {string} name - User's name
   * @param {number} baselineFootprint - Monthly limit in kg CO2
   * @returns {Promise<object>} UserResponse
   */
  async createUser(name, baselineFootprint) {
    try {
      const response = await client.post('/users/', {
        name,
        baseline_footprint: parseFloat(baselineFootprint),
      });
      return response.data;
    } catch (error) {
      console.error('API Error in createUser:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Log a carbon activity for the user
   * @param {string} userId - User's unique ID
   * @param {string} activityType - transport, diet, or energy
   * @param {number} value - Numerical consumption metric
   * @returns {Promise<object>} ActivityLog
   */
  async logActivity(userId, activityType, value) {
    try {
      const response = await client.post('/activities/', {
        user_id: userId,
        activity_type: activityType.toLowerCase(),
        value: parseFloat(value),
      });
      return response.data;
    } catch (error) {
      console.error('API Error in logActivity:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Fetch the user's carbon dashboard
   * @param {string} userId - User's unique ID
   * @returns {Promise<object>} DashboardResponse
   */
  async getDashboard(userId) {
    try {
      const response = await client.get(`/dashboard/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error in getDashboard:', error);
      throw this.handleError(error);
    }
  },

  // Centrally parse API error messages
  handleError(error) {
    if (error.response && error.response.data && error.response.data.detail) {
      return new Error(error.response.data.detail);
    }
    return new Error(error.message || 'Network error occurred. Make sure your backend server is running!');
  }
};
