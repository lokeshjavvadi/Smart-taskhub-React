import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Test with direct URL first
const API_URL = 'http://localhost:5030/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔍 DEBUG: Starting login process...');
      console.log('📧 Email:', email);
      console.log('🔗 Target URL:', `${API_URL}/auth/login`);
      
      // Test if backend is reachable first
      console.log('🔄 Testing backend connectivity...');
      try {
        const testResponse = await axios.get(`${API_URL}/test`, { timeout: 5000 });
        console.log('✅ Backend test successful:', testResponse.data);
      } catch (testError) {
        console.error('❌ Backend test failed:', testError.message);
        return rejectWithValue(`Backend not reachable: ${testError.message}`);
      }

      // Now try login
      console.log('🔄 Attempting login...');
      const response = await axios.post(
        `${API_URL}/auth/login`, 
        { email, password }, 
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('✅ Login API response received:', response.status);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('✅ Token stored in localStorage');
        return response.data;
      } else {
        console.error('❌ No token in response');
        return rejectWithValue('No token received from server');
      }
    } catch (error) {
      console.error('❌ Login process failed completely');
      
      // Detailed error analysis
      if (error.code === 'ECONNREFUSED') {
        console.error('🔌 Connection refused - is backend running?');
        return rejectWithValue('Cannot connect to server. Make sure backend is running on port 5030.');
      } else if (error.code === 'NETWORK_ERROR') {
        console.error('🌐 Network error - check internet connection');
        return rejectWithValue('Network error. Check your internet connection.');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('📡 Network request failed');
        return rejectWithValue('Network request failed. Backend might be down.');
      } else if (error.response) {
        // Server responded with error status
        console.error('📊 Server responded with error:', error.response.status);
        console.error('📄 Error data:', error.response.data);
        return rejectWithValue(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // Request made but no response received
        console.error('📨 Request sent but no response received');
        console.error('Request details:', error.request);
        return rejectWithValue('No response from server. Backend might be down or not accessible.');
      } else {
        // Something else happened
        console.error('💥 Unknown error:', error.message);
        return rejectWithValue(error.message || 'Unknown error occurred during login');
      }
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      console.log('🔍 DEBUG: Starting registration process...');
      console.log('👤 Name:', name);
      console.log('📧 Email:', email);
      console.log('🔗 Target URL:', `${API_URL}/auth/register`);

      // Test backend first
      try {
        await axios.get(`${API_URL}/test`, { timeout: 5000 });
        console.log('✅ Backend test successful');
      } catch (testError) {
        console.error('❌ Backend test failed:', testError.message);
        return rejectWithValue(`Backend not reachable: ${testError.message}`);
      }

      const response = await axios.post(
        `${API_URL}/auth/register`,
        { name, email, password },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('✅ Registration API response received:', response.status);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('✅ Token stored in localStorage');
        return response.data;
      } else {
        return rejectWithValue('No token received from server');
      }
    } catch (error) {
      console.error('❌ Registration process failed completely');
      
      if (error.code === 'ECONNREFUSED') {
        return rejectWithValue('Cannot connect to server. Make sure backend is running on port 5030.');
      } else if (error.response) {
        console.error('📊 Server error response:', error.response.data);
        return rejectWithValue(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        return rejectWithValue('No response from server. Backend might be down.');
      } else {
        return rejectWithValue(error.message || 'Unknown error occurred during registration');
      }
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 getCurrentUser - Token found:', !!token);
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ getCurrentUser - Success');
      return response.data;
    } catch (error) {
      console.error('❌ getCurrentUser - Failed:', error.response?.data || error.message);
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;