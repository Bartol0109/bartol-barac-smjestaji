import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      {/* Auth links */}
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end h-8 items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-300">Dobrodošli, {user.username}!</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-300 hover:text-white cursor-pointer"
                >
                  Odjava
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-white">
                  Prijava
                </Link>
                <span className="text-gray-500">|</span>
                <Link to="/register" className="text-sm text-gray-300 hover:text-white">
                  Registracija
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                HoolidayInc
              </Link>
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2">Početna</Link>
              <Link
                to="/apartments"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Smještaji
              </Link>
              {user && (
                <Link
                  to="/bookings"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Moje rezervacije
                </Link>
              )}
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2">Kontakt</Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                {isOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link
                  to="/"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Početna
                </Link>
                <Link
                  to="/apartments"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Smještaji
                </Link>
                {user && (
                  <Link
                    to="/bookings"
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Moje rezervacije
                  </Link>
                )}
                <Link
                  to="/contact"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Kontakt
                </Link>
                {!user && (
                  <>
                    <Link
                      to="/login"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Prijava
                    </Link>
                    <Link
                      to="/register"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Registracija
                    </Link>
                  </>
                )}
                {user && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                  >
                    Odjava
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;