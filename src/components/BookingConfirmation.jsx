import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingDetails } = location.state || {};

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">
              Nema dostupnih podataka o rezervaciji
            </div>
            <button
              onClick={() => navigate('/apartments')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300"
            >
              Povratak na apartmane
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    apartment_title,
    check_in_date,
    check_out_date,
    guests_number,
    first_name,
    last_name,
    email,
    total_price,
    bookingId
  } = bookingDetails;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
            <svg className="w-16 h-16 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold">Rezervacija je uspješno kreirana!</h2>
            <p className="text-sm mt-2">Broj rezervacije: {bookingDetails.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Detalji apartmana</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Apartman:</span> {apartment_title}</p>
              <p><span className="font-medium">Check-in:</span> {new Date(check_in_date).toLocaleDateString('hr')}</p>
              <p><span className="font-medium">Check-out:</span> {new Date(check_out_date).toLocaleDateString('hr')}</p>
              <p><span className="font-medium">Broj gostiju:</span> {guests_number}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Detalji gosta</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Ime:</span> {first_name}</p>
              <p><span className="font-medium">Prezime:</span> {last_name}</p>
              <p><span className="font-medium">Email:</span> {email}</p>
              <p><span className="font-medium">Ukupna cijena:</span> {total_price.toLocaleString('hr')} €</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/apartments')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300"
          >
            Povratak na apartmane
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition duration-300"
          >
            Moje rezervacije
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation; 