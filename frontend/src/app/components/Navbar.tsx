// components/Navbar.tsx
'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">CourtBook</Link>
        <div>
          {loading ? null : user ? (
            <>
              <span className="mr-4">Welcome, {user.name}</span>
              <Link href="/bookings/my-bookings" className="mr-4 hover:text-gray-300">My Bookings</Link>
              <button onClick={logout} className="hover:text-gray-300">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-4 hover:text-gray-300">Login</Link>
              <Link href="/register" className="hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;