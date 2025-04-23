import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import UserDropdown from './UserDropdown';

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      if (theme) return theme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(systemDark);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-2xl text-pink-600 tracking-tight">KS</span>
            <Link to="/" className="text-pink-500 font-bold text-xl tracking-tight">kalsoftware</Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 justify-center mx-6">
            <form onSubmit={handleSearch} className="flex w-full max-w-lg relative group">
              <input
                className={`flex-1 px-8 py-3 rounded-full border-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg shadow-md placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${searchFocused ? 'ring-2 ring-pink-400 scale-105 bg-white dark:bg-gray-900 z-10' : ''}`}
                style={{ transition: 'width 0.3s', width: searchFocused ? '420px' : '260px' }}
                type="text"
                placeholder="Search videos, channels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search"
                autoComplete="off"
              />
              <button
                className="px-6 py-3 bg-pink-500 text-white rounded-r-full hover:bg-pink-600 transition-colors text-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:z-10 -ml-2"
                type="submit"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              {search && (
                <button
                  type="button"
                  onClick={()=>setSearch('')}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors focus:outline-none"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </form>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-3">
            <button
              aria-label="Toggle dark mode"
              onClick={() => setDark(d => !d)}
              className="text-2xl px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >{dark ? '🌙' : '☀️'}</button>
            <Link className="navbar-link px-3 py-1 font-medium hover:bg-pink-50 dark:hover:bg-gray-800 rounded transition" to="/upload">Upload</Link>
            <Link to="/subscriptions" className="navbar-link-btn text-yellow-500 font-semibold px-3 py-1 rounded transition">Subscriptions</Link>
            {!user && <Link className="navbar-link px-3 py-1" to="/login">Login</Link>}
            {!user && <Link className="navbar-link px-3 py-1" to="/register">Register</Link>}
            {user && <UserDropdown />}
            <span className="notification-bell text-2xl ml-2" title="Notifications">🔔</span>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(m => !m)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label="Open main menu"
            >
              <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg animate-fadeIn">
          <div className="px-4 pt-4 pb-1 flex flex-col gap-3">
            <form onSubmit={handleSearch} className="flex w-full mb-2 relative group">
              <input
                className={`flex-1 px-6 py-3 rounded-full border-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg shadow-md placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${searchFocused ? 'ring-2 ring-pink-400 scale-105 bg-white dark:bg-gray-900 z-10' : ''}`}
                style={{ transition: 'width 0.3s', width: searchFocused ? '100%' : '70%' }}
                type="text"
                placeholder="Search videos, channels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search"
                autoComplete="off"
              />
              <button
                className="px-5 py-3 bg-pink-500 text-white rounded-r-full hover:bg-pink-600 transition-colors text-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:z-10 -ml-2"
                type="submit"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
              {search && (
                <button
                  type="button"
                  onClick={()=>setSearch('')}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors focus:outline-none"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </form>
            <>
              <button
                aria-label="Toggle dark mode"
                onClick={() => setDark(d => !d)}
                className="text-2xl px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-fit"
              >{dark ? '🌙' : '☀️'}</button>
              <Link className="navbar-link px-3 py-1 font-medium hover:bg-pink-50 dark:hover:bg-gray-800 rounded transition" to="/upload" onClick={()=>setMobileMenuOpen(false)}>Upload</Link>
              <Link to="/subscriptions" className="navbar-link-btn text-yellow-500 font-semibold px-3 py-1 rounded transition" onClick={()=>setMobileMenuOpen(false)}>Subscriptions</Link>
              {!user && <Link className="navbar-link px-3 py-1" to="/login" onClick={()=>setMobileMenuOpen(false)}>Login</Link>}
              {!user && <Link className="navbar-link px-3 py-1" to="/register" onClick={()=>setMobileMenuOpen(false)}>Register</Link>}
              {user && <UserDropdown />}
              <span className="notification-bell text-2xl ml-2" title="Notifications">🔔</span>
            </>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
