
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearAuthError } from './authSlice.ts';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../../store.ts';

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

const AuthForm = () => {
  const path = window.location.pathname;
  const [isLogin, setIsLogin] = useState(path !== '/register');
  const [form, setForm] = useState({ name: '', email: '', password: '', pin: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState('');

  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/wallet', { replace: true });
  }, [token, navigate]);

  // Clear errors when switching modes
  useEffect(() => {
    setClientError('');
    dispatch<any>(clearAuthError());
  }, [isLogin, dispatch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (clientError) setClientError('');
  };

  const validate = (): string => {
    if (!isLogin && !form.name.trim()) return 'Name is required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Please enter a valid email address';
    if (!isLogin && form.password.length < 8)
      return 'Password must be at least 8 characters';
    if (!form.password) return 'Password is required';
    if (!isLogin && form.pin && (form.pin.length !== 4 || !/^\d{4}$/.test(form.pin)))
      return 'PIN must be exactly 4 digits';
    return '';
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) return setClientError(err);

    if (isLogin) {
      dispatch<any>(login({ email: form.email, password: form.password }));
    } else {
      dispatch<any>(register({ name: form.name, email: form.email, password: form.password, pin: form.pin || undefined }));
    }
  };

  const displayError = clientError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl">💸</span>
          <span className="text-2xl font-bold text-blue-700">FintechApp</span>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          {isLogin ? 'Sign in to access your wallet' : 'Start managing your money today'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password {!isLogin && <span className="text-gray-400 font-normal">(min 8 characters)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                4-Digit Transaction PIN <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="password"
                name="pin"
                id="pin"
                placeholder="••••"
                value={form.pin}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={4}
                autoComplete="new-password"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
          )}

          {displayError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <span>⚠</span>
              <span>{displayError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline font-semibold"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
