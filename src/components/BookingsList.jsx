import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Greška pri dohvaćanju rezervacija');
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(`${API_URL}/api/bookings/${bookingId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Greška pri otkazivanju rezervacije');
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovu otkazanu rezervaciju?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`${API_URL}/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error deleting booking:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Greška pri brisanju rezervacije');
      }
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Moje rezervacije</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nema rezervacija</h3>
            <p className="mt-1 text-sm text-gray-500">Započnite tako da rezervirate neki od naših apartmana.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/apartments')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Pregledaj apartmane
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={booking.image_url}
                            alt={booking.apartment_title}
                          />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{booking.apartment_title}</h4>
                          <p className="text-sm text-gray-500">{booking.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Status: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Potvrđeno' : 'Otkazano'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="mt-1 text-sm text-gray-900">{new Date(booking.check_in_date).toLocaleDateString('hr')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="mt-1 text-sm text-gray-900">{new Date(booking.check_out_date).toLocaleDateString('hr')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Broj gostiju</p>
                        <p className="mt-1 text-sm text-gray-900">{booking.guests_number}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-lg font-bold text-blue-600">
                        {booking.total_price.toLocaleString('hr')} €
                      </p>
                      <div className="space-x-2">
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            Otkaži rezervaciju
                          </button>
                        )}
                        {booking.status === 'cancelled' && (
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                          >
                            Obriši rezervaciju
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsList; 