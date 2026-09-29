import axios from 'axios';

// Create Axios Instance
const API = axios.create({
  baseURL: '/api',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if present
API.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('task_app_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error('Failed parsing saved token', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global 401 unauth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const userStr = localStorage.getItem('task_app_user');
      let isMockUser = false;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.token?.startsWith('mock-jwt-') || user?._id?.startsWith('u-')) {
            isMockUser = true;
          }
        } catch (e) {}
      }

      // Clear token and redirect ONLY if NOT a mock session
      if (!isMockUser && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('task_app_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
