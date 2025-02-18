'use client';
import { useState } from 'react';
import api from '../../utils/api';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function ResetPassword({ params }) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const router = useRouter();
  const { token } = params;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/resetPassword/${token}`, { password, passwordConfirm });
      alert('Password reset successful!');
      router.push('/login');
    } catch (error) {
      console.error('Error:', error.response?.data?.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="password">
                New Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" htmlFor="passwordConfirm">
                Confirm New Password
              </label>
              <input
                type="password"
                id="passwordConfirm"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Confirm new password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
}