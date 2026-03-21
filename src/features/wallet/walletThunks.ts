import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { set } from 'idb-keyval';

const API_URL = 'https://offline-api.onrender.com/api/wallet';

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  reference?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

const getToken = () => localStorage.getItem('token');

const extractError = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};

// ─── Airtime ─────────────────────────────────────────────────────────────────
export const buyAirtime = createAsyncThunk<
  number,
  { amount: number; phone: string; network: string; reference?: string },
  { rejectValue: string }
>('wallet/buyAirtime', async (payload, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/airtime`, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance as number;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractError(err, 'Airtime purchase failed'));
  }
});
// ─── Fund Wallet ─────────────────────────────────────────────────────────────
export const fundWallet = createAsyncThunk<
  number,
  { amount: number; reference?: string; details?: string },
  { rejectValue: string }
>('wallet/fundWallet', async (payload, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/fund`, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance as number;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractError(err, 'Funding failed'));
  }
});

// ─── Withdraw ────────────────────────────────────────────────────────────────
export const withdrawToBank = createAsyncThunk<
  number,
  { amount: number; reference?: string; details?: string },
  { rejectValue: string }
>('wallet/withdrawToBank', async (payload, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/withdraw`, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance as number;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractError(err, 'Withdrawal failed'));
  }
});

// ─── Transfer ────────────────────────────────────────────────────────────────
export const transfer = createAsyncThunk<
  number,
  { amount: number; accountNumber: string; reference?: string; details?: string },
  { rejectValue: string }
>('wallet/transfer', async (payload, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/transfer`, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance as number;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractError(err, 'Transfer failed'));
  }
});

// ─── Pay Bill ────────────────────────────────────────────────────────────────
export const payBill = createAsyncThunk<
  number,
  { amount: number; biller: string; reference?: string; details?: string },
  { rejectValue: string }
>('wallet/payBill', async (payload, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/pay-bill`, payload, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance as number;
  } catch (err) {
    return thunkAPI.rejectWithValue(extractError(err, 'Bill payment failed'));
  }
});

// ─── Transactions ────────────────────────────────────────────────────────────
export const fetchTransactions = createAsyncThunk<
  Transaction[],
  void,
  { rejectValue: string }
>('wallet/fetchTransactions', async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data.transactions as Transaction[];
  } catch (err) {
    return thunkAPI.rejectWithValue(extractError(err, 'Unable to fetch transactions'));
  }
});
