import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-400">HoolidayInc</h3>
            <p className="text-gray-300 text-sm">Pronađite svoj savršen smještaj.</p>
          </div>
        </div>
        <div className="mt-4 text-center md:mt-0">
          <p className="text-gray-300 text-sm">&copy; 2023 HoolidayInc. Sva prava pridržana.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer