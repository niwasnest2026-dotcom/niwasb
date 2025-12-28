'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';

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
        backgroundColor: 'rgba(45, 55, 72, 0.95)', 
        borderBottomColor: 'rgba(99, 179, 237, 0.3)' 
      }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold" style={{ color: '#F7FAFC' }}>
                <span style={{ color: '#FF6711' }}>Niwas</span> Nest
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/listings"
                className="font-medium transition-colors"
                style={{ color: '#F7FAFC' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFD082'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#F7FAFC'}
              >
                Browse Listings
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="font-medium transition-colors"
                  style={{ color: '#F7FAFC' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFD082'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#F7FAFC'}
                >
                  Admin
                </Link>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                    style={{ backgroundColor: 'rgba(255, 208, 130, 0.2)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 208, 130, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 208, 130, 0.2)'}
                    title="View Profile"
                  >
                    <FaUser className="text-lg" style={{ color: '#F7FAFC' }} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{ color: '#F7FAFC' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFD082'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F7FAFC'}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{ color: '#F7FAFC' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FFD082'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F7FAFC'}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2 text-sm font-bold rounded-xl transition-all shadow-lg"
                    style={{ color: '#F7FAFC', backgroundColor: '#FF6711' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E55A0F';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 103, 17, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF6711';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }}
                  >
                    Book a Stay
                  </Link>
                </div>
              )}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
              style={{ color: '#F7FAFC' }}
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t" style={{ backgroundColor: '#2D3748', borderTopColor: 'rgba(99, 179, 237, 0.3)' }}>
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
              <Link
                href="/listings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ color: '#F7FAFC' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 208, 130, 0.1)';
                  e.currentTarget.style.color = '#FFD082';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#F7FAFC';
                }}
              >
                Browse Listings
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ color: '#F7FAFC' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 208, 130, 0.1)';
                    e.currentTarget.style.color = '#FFD082';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#F7FAFC';
                  }}
                >
                  Admin
                </Link>
              )}

              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm rounded-lg font-medium transition-colors border-t pt-3"
                    style={{ 
                      color: 'rgba(247, 250, 252, 0.8)', 
                      borderTopColor: 'rgba(99, 179, 237, 0.3)' 
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 208, 130, 0.1)';
                      e.currentTarget.style.color = '#FFD082';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(247, 250, 252, 0.8)';
                    }}
                  >
                    <FaUser className="mr-3" />
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ color: '#F7FAFC' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 208, 130, 0.1)';
                      e.currentTarget.style.color = '#FFD082';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#F7FAFC';
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-3" style={{ borderTop: '1px solid rgba(99, 179, 237, 0.3)' }}>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ color: '#F7FAFC' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 208, 130, 0.1)';
                      e.currentTarget.style.color = '#FFD082';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#F7FAFC';
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-bold rounded-lg transition-all"
                    style={{ color: '#F7FAFC', backgroundColor: '#FF6711' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E55A0F';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF6711';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Book a Stay
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
