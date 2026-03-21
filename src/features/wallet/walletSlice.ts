
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { set, get } from 'idb-keyval';

import {
  fundWallet,
  withdrawToBank,
  transfer,
  payBill,
  fetchTransactions,
  buyAirtime,
} from './walletThunks.ts';

const API_URL = 'https://offline-api.onrender.com/api/wallet';

export const fetchBalance = createAsyncThunk<number, void, { rejectValue: string }>(
  'wallet/fetchBalance',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<{ balance: number }>(`${API_URL}/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await set('wallet_balance', res.data.balance);
      return res.data.balance;
    } catch {
      const cached = await get<number>('wallet_balance');
      if (cached !== undefined) return cached;
      return thunkAPI.rejectWithValue('Unable to fetch balance');
    }
  }
);

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  reference?: string;
  details?: Record<string, unknown>;
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

const setBalance = (state: WalletState, balance: number) => {
  state.loading = false;
  state.balance = balance;
  state.error = null;
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── Balance ──────────────────────────────
      .addCase(fetchBalance.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBalance.fulfilled, (state, action) => setBalance(state, action.payload))
      .addCase(fetchBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unable to fetch balance';
      })
      // ─── Fund ────────────────────────────────
      .addCase(fundWallet.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fundWallet.fulfilled, (state, action) => setBalance(state, action.payload))
      .addCase(fundWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Funding failed';
      })
      // ─── Withdraw ────────────────────────────
      .addCase(withdrawToBank.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(withdrawToBank.fulfilled, (state, action) => setBalance(state, action.payload))
      .addCase(withdrawToBank.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Withdrawal failed';
      })
      // ─── Transfer ────────────────────────────
      .addCase(transfer.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(transfer.fulfilled, (state, action) => setBalance(state, action.payload))
      .addCase(transfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Transfer failed';
      })
      // ─── Pay Bill ────────────────────────────
      .addCase(payBill.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(payBill.fulfilled, (state, action) => setBalance(state, action.payload))
      .addCase(payBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Bill payment failed';
      })
      // ─── Airtime ─────────────────────────────
      .addCase(buyAirtime.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(buyAirtime.fulfilled, (state, action) => setBalance(state, action.payload))
      .addCase(buyAirtime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Airtime purchase failed';
      })
      // ─── Transactions ────────────────────────
      .addCase(fetchTransactions.pending, (state) => { state.txLoading = true; state.txError = null; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.txLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.txLoading = false;
        state.txError = action.payload ?? 'Unable to fetch transactions';
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;
