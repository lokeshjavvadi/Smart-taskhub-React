import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5030/api';

// Async thunks
export const fetchProjectTasks = createAsyncThunk(
  'tasks/fetchProjectTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tasks/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      console.log('🔍 DEBUG: Starting task creation...');
      console.log('📦 Task data:', taskData);
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.post(
        `${API_URL}/tasks`,
        taskData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Task creation response:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      return response.data;
    } catch (error) {
      console.error('❌ Task creation failed:', error);
      
      // Get the actual error message from backend
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create task';
      
      console.log('📋 Backend error details:', error.response?.data);
      
      return rejectWithValue(errorMessage);
    }
  }
);


export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    currentProjectTasks: [],
    loading: false,
    error: null,
    aiPrioritizedTasks: []
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateTaskRealTime: (state, action) => {
      const { type, task } = action.payload;
      
      switch (type) {
        case 'created':
          state.currentProjectTasks.push(task);
          break;
        case 'updated':
          const index = state.currentProjectTasks.findIndex(t => t._id === task._id);
          if (index !== -1) {
            state.currentProjectTasks[index] = task;
          }
          break;
        default:
          break;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch project tasks
      .addCase(fetchProjectTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProjectTasks = action.payload;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch tasks';
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.currentProjectTasks.push(action.payload);
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.currentProjectTasks.findIndex(
          task => task._id === action.payload._id
        );
        if (index !== -1) {
          state.currentProjectTasks[index] = action.payload;
        }
      })
// Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
  state.currentProjectTasks = state.currentProjectTasks.filter(
    task => task._id !== action.payload
  );
})




      
  }
});

export const { clearError, updateTaskRealTime } = taskSlice.actions;
export default taskSlice.reducer;