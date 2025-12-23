'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function Header() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();

        setIsAdmin((data as any)?.is_admin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    }

    checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-neutral-900">
                <span className="text-primary">Niwas</span> Nest
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/listings"
                className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
              >
                Browse Listings
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
                >
                  Admin
                </Link>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-neutral-600 text-sm truncate max-w-[150px]">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-neutral-700 hover:text-neutral-900 p-2"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
              <Link
                href="/listings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
              >
                Browse Listings
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
                >
                  Admin
                </Link>
              )}

              {user ? (
                <>
                  <div className="px-4 py-2 text-neutral-600 text-sm border-t pt-3">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-3 border-t">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>


    </>
  );
}
