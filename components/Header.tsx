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
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:backdrop-blur" style={{ 
        backgroundColor: 'rgba(43, 122, 120, 0.95)', 
        borderBottomColor: 'rgba(58, 175, 169, 0.3)' 
      }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold" style={{ color: '#FEFFFF' }}>
                <span style={{ color: '#DEF2F1' }}>Niwas</span> Nest
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/listings"
                className="font-medium transition-colors"
                style={{ color: '#DEF2F1' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FEFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#DEF2F1'}
              >
                Browse Listings
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="font-medium transition-colors"
                  style={{ color: '#DEF2F1' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FEFFFF'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#DEF2F1'}
                >
                  Admin
                </Link>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm truncate max-w-[150px]" style={{ color: 'rgba(222, 242, 241, 0.8)' }}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{ color: '#DEF2F1' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FEFFFF'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#DEF2F1'}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{ color: '#DEF2F1' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FEFFFF'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#DEF2F1'}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ color: '#17252A', backgroundColor: '#DEF2F1' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEFFFF';
                      e.currentTarget.style.color = '#17252A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#DEF2F1';
                      e.currentTarget.style.color = '#17252A';
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
              style={{ color: '#DEF2F1' }}
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t" style={{ backgroundColor: '#2B7A78', borderTopColor: 'rgba(58, 175, 169, 0.3)' }}>
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
              <Link
                href="/listings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ color: '#DEF2F1' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(222, 242, 241, 0.1)';
                  e.currentTarget.style.color = '#FEFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#DEF2F1';
                }}
              >
                Browse Listings
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ color: '#DEF2F1' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(222, 242, 241, 0.1)';
                    e.currentTarget.style.color = '#FEFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#DEF2F1';
                  }}
                >
                  Admin
                </Link>
              )}

              {user ? (
                <>
                  <div className="px-4 py-2 text-sm border-t pt-3" style={{ 
                    color: 'rgba(222, 242, 241, 0.8)', 
                    borderTopColor: 'rgba(58, 175, 169, 0.3)' 
                  }}>
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ color: '#DEF2F1' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(222, 242, 241, 0.1)';
                      e.currentTarget.style.color = '#FEFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#DEF2F1';
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-3" style={{ borderTop: '1px solid rgba(58, 175, 169, 0.3)' }}>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ color: '#DEF2F1' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(222, 242, 241, 0.1)';
                      e.currentTarget.style.color = '#FEFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#DEF2F1';
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ color: '#17252A', backgroundColor: '#DEF2F1' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FEFFFF';
                      e.currentTarget.style.color = '#17252A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#DEF2F1';
                      e.currentTarget.style.color = '#17252A';
                    }}
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
