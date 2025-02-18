'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchUser, logout } from './../utils/api';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      fetchUser().then((userData) => {
        setUser(userData);
      }).catch(() => {
        setIsLoggedIn(false);
      });
    }
  }, []);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <span className="text-white text-xl font-bold">E-Commerce</span>
        </Link>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center justify-center w-10 h-10 bg-white rounded-full text-blue-600 font-bold hover:bg-gray-200 focus:outline-none"
              >
                {user ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
                  <Link href="/update-password">
                    <div className="block px-4 py-2 text-gray-800 hover:bg-blue-100">Change Password</div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
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