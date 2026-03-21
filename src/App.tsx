
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthForm from './features/auth/AuthForm.tsx';
import LandingPage from './LandingPage.tsx';
import Wallet from './features/wallet/Wallet.tsx';
import { RootState } from './store.ts';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/register" element={<AuthForm />} />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
