'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

export default function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      if (!token || !userData) {
        // If the user is not logged in, redirect them to the login page
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubscribe = async (plan) => {
    setLoading(true);
    setError('');

    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.email) {
        throw new Error('User email not found');
      }

      // Include success_url and cancel_url in the request
      const response = await api.post('/payments/create-subscription', {
        plan,
        userEmail: userData.email,
        successUrl: `${window.location.origin}/dashboard`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      if (!response?.data?.data?.checkoutUrl) {
        throw new Error('Invalid response from payment service');
      }

      // Redirect to checkout
      window.location.href = response.data.data.checkoutUrl;
    } catch (err) {
      console.error('Subscription error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      let errorMessage;
      if (err.response?.status === 401) {
        errorMessage = 'Please log in again';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Invalid subscription request';
      } else if (err.response?.status === 500) {
        errorMessage = 'Payment system is temporarily unavailable';
      } else {
        errorMessage = err.message || 'Failed to process subscription';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Choose a Plan</h1>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Monthly Plan</h2>
              <p className="text-gray-600 mb-4">$19/month</p>
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  'Subscribe Monthly'
                )}
              </button>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Yearly Plan</h2>
              <p className="text-gray-600 mb-4">$99/year</p>
              <button
                onClick={() => handleSubscribe('yearly')}
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  'Subscribe Yearly'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}