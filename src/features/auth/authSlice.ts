import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/auth';
const API_URL = 'https://offline-api.onrender.com/api/auth';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  pin?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterPayload, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/register`, userData);
      return res.data;
    } catch (err) {
      let message = 'Registration failed';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData: LoginPayload, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/login`, userData);
      return res.data;
    } catch (err) {
      let message = 'Login failed';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
