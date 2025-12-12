// Airtime purchase thunk
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { set, get } from 'idb-keyval';

const API_URL = 'http://localhost:5000/api/wallet';

// ...existing code...

export const buyAirtime = createAsyncThunk('wallet/buyAirtime', async ({ amount, phone, network }: any, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/airtime`, { amount, phone, network }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance;
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message) {
      return thunkAPI.rejectWithValue(err.response.data.message);
    }
    return thunkAPI.rejectWithValue('Airtime purchase failed');
  }
});
// Add new thunks for real-world wallet flows
export const fundWallet = createAsyncThunk('wallet/fundWallet', async ({ amount, reference, details }: any, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/fund`, { amount, reference, details }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance;
  } catch (err) {
    return thunkAPI.rejectWithValue('Funding failed');
  }
});

export const withdrawToBank = createAsyncThunk('wallet/withdrawToBank', async ({ amount, reference, details }: any, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/withdraw`, { amount, reference, details }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance;
  } catch (err) {
    return thunkAPI.rejectWithValue('Withdraw failed');
  }
});

export const transfer = createAsyncThunk('wallet/transfer', async ({ amount, accountNumber, reference, details }: any, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/transfer`, { amount, accountNumber, reference, details }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance;
  } catch (err) {
    return thunkAPI.rejectWithValue('Transfer failed');
  }
});

export const payBill = createAsyncThunk('wallet/payBill', async ({ amount, biller, reference, details }: any, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/pay-bill`, { amount, biller, reference, details }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance;
  } catch (err) {
    return thunkAPI.rejectWithValue('Bill payment failed');
  }
});

export const fetchTransactions = createAsyncThunk('wallet/fetchTransactions', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.transactions;
  } catch (err) {
    return thunkAPI.rejectWithValue('Unable to fetch transactions');
  }
});

// ...existing code...
