import { configureStore } from '@reduxjs/toolkit';


import authReducer from './features/auth/authSlice.ts';
import walletReducer from './features/wallet/walletSlice.ts';

const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
