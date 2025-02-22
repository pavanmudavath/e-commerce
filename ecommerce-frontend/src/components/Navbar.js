'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from './../utils/api'; // Import the api module

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      if (!token || !userData) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        // Fetch the user's data
        const userResponse = await api.get('/users/me');
        setUser(userResponse.data.data.user);

        // Fetch the user's subscription status
        const subscriptionResponse = await api.get('/payments/subscriptions/current');
        if (subscriptionResponse.data.data.subscription?.status === 'active') {
          setHasSubscription(true);
        }
      } catch (err) {
        console.error('Failed to fetch user or subscription data:', err);
      }
    };

    checkAuthAndSubscription();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <span className="text-white text-xl font-bold">E-Commerce</span>
        </Link>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* Show Dashboard link if the user has an active subscription */}
              {hasSubscription && (
                <Link href="/dashboard" className="text-white hover:text-blue-200">
                  Dashboard
                </Link>
              )}

              {/* Show Pricing link if the user does not have an active subscription */}
              {!hasSubscription && (
                <Link href="/pricing" className="text-white hover:text-blue-200">
                  Pricing
                </Link>
              )}

              {/* User Icon */}
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-white hover:text-blue-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login and Signup Links */}
              <Link href="/login" className="text-white hover:text-blue-200">
                Login
              </Link>
              <Link href="/signup" className="text-white hover:text-blue-200">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}