'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../utils/api';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);

      // Store the token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify({
        email: email,
        name: data.user?.name || 'User', // Adjust based on your API response
      }));

      // Redirect to the dashboard or pricing page
      router.push('/dashboard'); // Or /pricing, depending on your flow
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center">
            Don{`'`}t have an account?{' '}
            <Link href="/signup" className="text-blue-500">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-center">
            <Link href="/forgot-password" className="text-blue-500">
              Forgot Password?
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}