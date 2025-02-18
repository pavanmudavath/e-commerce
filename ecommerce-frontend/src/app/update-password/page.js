'use client';
import { useState } from 'react';
import api from '../../utils/api';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/updateMyPassword', {
        passwordCurrent: currentPassword,
        password: newPassword,
        passwordConfirm: newPasswordConfirm,
      });
      alert('Password updated successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error:', error.response?.data?.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Update Password</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="currentPassword">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" htmlFor="newPasswordConfirm">
                Confirm New Password
              </label>
              <input
                type="password"
                id="newPasswordConfirm"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Confirm new password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
}