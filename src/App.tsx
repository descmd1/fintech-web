
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes } from 'react-router-dom';
import AuthForm from './features/auth/AuthForm.tsx';
import LandingPage from './LandingPage.tsx';
import Wallet from './features/wallet/Wallet.tsx';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<AuthForm />} />
        <Route path='/register' element={<AuthForm />} />
        <Route path='/wallet' element={<Wallet />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
}

export default App;
