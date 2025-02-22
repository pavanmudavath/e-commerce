import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // Replace with your backend URL
});

// const api = axios.create({
//   baseURL: 'http://localhost:3000/api/v1', // Update this to match your backend
// });

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
///api/v1/users/login
// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/users/login';
    }
    return Promise.reject({
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status,
      details: error.response?.data
    });
  }
);

// Authentication endpoints
export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signup = async (formData) => {
  try {
    const response = await api.post('/users/signup', {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw {
      message: error.response?.data?.message || 'Signup failed',
      status: error.response?.status,
      details: error.response?.data
    };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  // Optional: Clear other stored data
  localStorage.removeItem('user');
};

// User profile endpoints
export const fetchUser = async () => {
  try {
    const response = await api.get('/users/me');
    return response.data.data.user; // Adjusted to match your backend response structure
  } catch (error) {
    console.error('Fetch user error:', error);
    throw error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.patch('/users/updateMe', userData);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// Password management endpoints
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/users/forgotPassword', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

export const resetPassword = async (token, password, passwordConfirm) => {
  try {
    const response = await api.patch(`/users/resetPassword/${token}`, { 
      password, 
      passwordConfirm 
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const updatePassword = async (currentPassword, newPassword, newPasswordConfirm) => {
  try {
    const response = await api.patch('/users/updateMyPassword', {
      passwordCurrent: currentPassword,
      password: newPassword,
      passwordConfirm: newPasswordConfirm,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};

// Product endpoints (you might want to move this to a separate file)
export const fetchProducts = async () => {
  try {
    const response = await api.get('/users/products');
    return response.data;
  } catch (error) {
    console.error('Fetch products error:', error);
    throw error;
  }
};

// Add this to your existing API utility
export const createSubscription = async (plan, userEmail) => {
  try {
    const response = await api.post('/payments/create-subscription', {
      plan,
      userEmail,
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Failed to create subscription.');
  }
};



export default api;