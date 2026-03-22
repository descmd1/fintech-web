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

export interface Bank {
  name: string;
  code: string;
}

const FALLBACK_BANKS: Bank[] = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank Nigeria', code: '023' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank', code: '214' },
  { name: 'Globus Bank', code: '00103' },
  { name: 'Guaranty Trust Bank', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Moniepoint MFB', code: '50515' },
  { name: 'Opay', code: '999992' },
  { name: 'Palmpay', code: '100033' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Titan Trust Bank', code: '102' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank For Africa', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];

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

export const fetchBanks = createAsyncThunk<Bank[], void, { rejectValue: string }>(
  'wallet/fetchBanks',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/banks`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return (res.data.banks || []) as Bank[];
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return FALLBACK_BANKS;
      }
      return FALLBACK_BANKS;
    }
  }
);

export const resolveAccountName = createAsyncThunk<
  { accountName: string; accountNumber: string; bankCode?: string; bankName?: string },
  { accountNumber: string; bankCode?: string; bankName?: string },
  { rejectValue: string }
>('wallet/resolveAccountName', async (payload, thunkAPI) => {
  try {
    const res = await axios.get(`${API_URL}/resolve-account`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      params: payload,
    });
    return res.data as {
      accountName: string;
      accountNumber: string;
      bankCode?: string;
      bankName?: string;
    };
  } catch (err) {
    return thunkAPI.rejectWithValue(extractError(err, 'Unable to resolve account name'));
  }
});
