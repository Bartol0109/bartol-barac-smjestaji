import React from 'react';
import { useNavigate } from 'react-router-dom';

function UnavailableApartment() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Apartman nije dostupan
            </h2>
            
            <p className="mt-2 text-gray-600">
              Nažalost, sve jedinice su rezervirane za odabrani period.
            </p>

            <div className="mt-6 space-y-4">
              <button
                onClick={() => navigate('/apartments')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Pregledaj ostale apartmane
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Povratak na prethodnu stranicu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnavailableApartment; 