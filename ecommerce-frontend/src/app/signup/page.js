'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Make sure all fields are filled
      if (!formData.name || !formData.email || !formData.password || !formData.passwordConfirm) {
        throw new Error('Please fill in all fields');
      }

      // Check if passwords match
      if (formData.password !== formData.passwordConfirm) {
        throw new Error('Passwords do not match');
      }

      // Signup the user
      const response = await api.post('/users/signup', formData);

      if (response.data.token) {
        // Store the token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          email: formData.email,
          name: formData.name,
        }));

        // Redirect to the pricing page after signup
        router.push('/pricing');
      } else {
        throw new Error('Signup successful but no token received');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Signup</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" htmlFor="passwordConfirm">
                Confirm Password
              </label>
              <input
                type="password"
                id="passwordConfirm"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                minLength="8"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-4 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 hover:text-blue-600">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}