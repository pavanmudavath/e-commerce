import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to E-Commerce</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Explore our amazing products and enjoy a seamless shopping experience.
        </p>
        {/* <div className="space-x-4">
          <Link
            href="/login"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Signup
          </Link>
        </div> */}
      </div>
    </>
  );
}