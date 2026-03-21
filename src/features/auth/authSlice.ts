import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://offline-api.onrender.com/api/auth';

interface User {
  id: string;
  name: string;
  email: string;
  accountNumber?: string;
}

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
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const extractErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};

export const register = createAsyncThunk<
  { user: User; token: string },
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (userData, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Registration failed'));
  }
});

export const login = createAsyncThunk<
  { user: User; token: string },
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (userData, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/login`, userData);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractErrorMessage(err, 'Login failed'));
  }
});

// Rehydrate from localStorage on app start
const storedToken = localStorage.getItem('token');
const storedUser = (() => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
})();

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
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
      localStorage.removeItem('user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
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
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
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
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Login failed';
      });
  },
});

export const { logout, clearAuthError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
