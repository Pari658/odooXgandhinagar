import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../lib/apiClient';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Check your email for a reset link.');
    } catch (err) {
      // Don't leak whether the email exists, just show a generic error or the API message
      setMessage(err.response?.data?.message || 'Check your email for a reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen font-sans bg-slate-50">
      <div className="p-10 bg-white rounded-xl shadow-md text-center max-w-md w-full mx-4">
        <h1 className="m-0 mb-2.5 text-2xl text-slate-900">Reset Password</h1>
        <p className="m-0 mb-6 text-slate-500 text-sm leading-relaxed">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 p-3 rounded-md text-left">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 cursor-pointer bg-blue-600 text-white border-none rounded-md font-semibold text-[15px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
