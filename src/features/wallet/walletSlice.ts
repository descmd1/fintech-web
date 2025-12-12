
import { createSlice } from '@reduxjs/toolkit';

import {
  fundWallet,
  withdrawToBank,
  transfer,
  payBill,
  fetchTransactions
} from './walletThunks.ts';

import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { set, get } from 'idb-keyval';

const API_URL = 'http://localhost:5000/api/wallet';

export const fetchBalance = createAsyncThunk('wallet/fetchBalance', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await set('wallet_balance', res.data.balance);
    return res.data.balance;
  } catch (err) {
    // Try to get cached balance if offline
    const cached = await get('wallet_balance');
    if (cached !== undefined) return cached;
    return thunkAPI.rejectWithValue('Unable to fetch balance');
  }
});


interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  reference?: string;
  details?: any;
  createdAt: string;
}

interface WalletState {
  balance: number;
  loading: boolean;
  error: string | null;
  transactions: Transaction[];
  txLoading: boolean;
  txError: string | null;
}

const initialState: WalletState = {
  balance: 0,
  loading: false,
  error: null,
  transactions: [],
  txLoading: false,
  txError: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Balance
      .addCase(fetchBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fund wallet
      .addCase(fundWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fundWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fundWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Withdraw to bank
      .addCase(withdrawToBank.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(withdrawToBank.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(withdrawToBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Transfer
      .addCase(transfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transfer.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(transfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Pay bill
      .addCase(payBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payBill.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(payBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.txLoading = true;
        state.txError = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.txLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.txLoading = false;
        state.txError = action.payload as string;
      });
  },
});

export default walletSlice.reducer;
