// components/Navbar.tsx
'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">🏟️ GameSplit</Link>
        
        <div className="flex items-center space-x-6">
          {(!user || user.role !== 'owner') && (
            <Link href="/courts" className="hover:text-gray-300">Browse Courts</Link>
          )}
          
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : user ? (
            <>
              {/* Owner-specific navigation */}
              {user.role === 'owner' && (
                <>
                  <Link href="/courts/my-courts" className="hover:text-gray-300 flex items-center gap-1">
                    🏟️ My Courts
                  </Link>
                  <Link href="/courts/create" className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                    ➕ Add Court
                  </Link>
                </>
              )}
              
              {/* Player-specific navigation */}
              {user.role !== 'owner' && (
                <Link href="/bookings/my-bookings" className="hover:text-gray-300">My Bookings</Link>
              )}
              
              {/* User info and logout */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-300 text-xs capitalize">{user.role}</div>
                  </div>
                </div>
                <button 
                  onClick={logout} 
                  className="hover:text-gray-300 text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">Login</Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;