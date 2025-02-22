'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch both user and subscription data
        const [userResponse, subscriptionResponse] = await Promise.all([
          api.get('/users/me'),
          api.get('/payments/subscriptions/current'),
        ]);

        setUser(userResponse.data.data.user);
        setSubscription(subscriptionResponse.data.data.subscription);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        if (err.response?.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-red-600 underline hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}!</h1>

              {subscription ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h2 className="text-lg font-semibold text-green-700">Active Subscription</h2>
                    <p className="text-green-600">
                      Plan: {subscription.plan_name}
                    </p>
                    <p className="text-green-600">
                      Status: {subscription.status}
                    </p>
                    {subscription.current_period_end && (
                      <p className="text-green-600">
                        Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <h2 className="text-lg font-semibold mb-2">Account Details</h2>
                    <p>Email: {user.email}</p>
                    <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-yellow-700">
                    You don{`'`}t have an active subscription.{' '}
                    <button
                      onClick={() => router.push('/pricing')}
                      className="text-yellow-800 underline hover:text-yellow-900"
                    >
                      View pricing plans
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}