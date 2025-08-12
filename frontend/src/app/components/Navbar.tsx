// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';

interface ProfileDropdownProps {
  user: any;
  logout: () => void;
}
function ProfileDropdown({ user, logout }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        {user.name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 z-50 animate-fade-in border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-500 capitalize">{user.role}</div>
          </div>
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
  <Link href="/" className="text-xl font-bold">🏟️</Link>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {(!user || user.role !== 'owner') && (
            <Link href="/courts" className="hover:text-gray-300" title="Browse Courts">🔍</Link>
          )}
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : user ? (
            <>
              {user.role === 'owner' && (
                <>
                  <Link href="/courts/my-courts" className="hover:text-gray-300 flex items-center gap-1" title="My Courts">
                    🏟️
                  </Link>
                  <Link href="/courts/create" className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm" title="Add Court">
                    ➕
                  </Link>
                </>
              )}
              {user.role !== 'owner' && (
                <Link href="/bookings/my-bookings" className="hover:text-gray-300" title="My Bookings">📅</Link>
              )}
              <div className="flex items-center space-x-3 relative">
                <ProfileDropdown user={user} logout={logout} />
              </div>

            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300" title="Login">🔑</Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded" title="Register">📝</Link>
            </>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-gray-900 bg-opacity-95 flex flex-col items-center py-4 space-y-4 md:hidden animate-fade-in z-50 shadow-xl">
            {(!user || user.role !== 'owner') && (
              <Link href="/courts" className="hover:text-gray-300 text-lg" onClick={() => setMenuOpen(false)} title="Browse Courts">🔍</Link>
            )}
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                {user.role === 'owner' && (
                  <>
                    <Link href="/courts/my-courts" className="hover:text-gray-300 flex items-center gap-1 text-lg" onClick={() => setMenuOpen(false)} title="My Courts">
                      🏟️
                    </Link>
                    <Link href="/courts/create" className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm" onClick={() => setMenuOpen(false)} title="Add Court">
                      ➕
                    </Link>
                  </>
                )}
                {user.role !== 'owner' && (
                  <Link href="/bookings/my-bookings" className="hover:text-gray-300 text-lg" onClick={() => setMenuOpen(false)} title="My Bookings">📅</Link>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-300 text-xs capitalize">{user.role}</div>
                  </div>
                </div>
                <button 
                  onClick={() => { logout(); setMenuOpen(false); }} 
                  className="hover:text-gray-300 text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-gray-300 text-lg" onClick={() => setMenuOpen(false)} title="Login">🔑</Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-lg" onClick={() => setMenuOpen(false)} title="Register">📝</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;