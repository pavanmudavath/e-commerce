'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from './../utils/api';
import Navbar from './../components/Navbar';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
        // Fetch the user's subscription status
        const subscriptionResponse = await api.get('/payments/subscriptions/current');
        if (subscriptionResponse.data.data.subscription?.status === 'active') {
          setHasSubscription(true);
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
      }
    };

    checkAuthAndSubscription();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to E-Commerce</h1>
          <p className="text-gray-600">Your one-stop shop for all things amazing!</p>
        </div>
      </div>
    </>
  );
}