import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5001';

// Helper to format date as YYYY-MM-DD in local time
const toLocalDateString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    guests_number: 1,
    first_name: '',
    last_name: '',
    email: ''
  });

  // Get dates and price from location.state
  const checkInDate = location.state?.checkInDate;
  const checkOutDate = location.state?.checkOutDate;
  // Convert to Date objects for display
  const checkInDateObj = checkInDate ? new Date(checkInDate) : null;
  const checkOutDateObj = checkOutDate ? new Date(checkOutDate) : null;
  const totalPrice = location.state?.totalPrice;

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/apartments/${id}`);
        setApartment(response.data);
      } catch (error) {
        console.error('Error fetching apartment:', error);
        setError('Greška pri dohvatu podataka o smještaju');
      } finally {
        setLoading(false);
      }
    };
    fetchApartment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!checkInDate || !checkOutDate) {
      setError('Nisu odabrani datumi rezervacije. Vratite se na apartman i odaberite datume.');
      return;
    }

    try {
      // Prepare booking data
      const bookingData = {
        apartment_id: apartment.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_price: totalPrice,
        guests_number: parseInt(formData.guests_number),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim()
      };

      // Send booking data to backend
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/bookings`, bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Navigate to booking confirmation with booking details
      navigate('/booking-confirmation', { 
        state: { 
          bookingDetails: {
            ...response.data,
            total_price: totalPrice,
            apartment_title: apartment.title,
            check_in_date: checkInDate,
            check_out_date: checkOutDate,
            guests_number: formData.guests_number,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email
          }
        }
      });
    } catch (error) {
      console.error('Booking error:', error);
      setError('Došlo je do greške prilikom kreiranja rezervacije.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">Smještaj nije pronađen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Rezervacija smještaja
          <span className="block text-xl text-blue-600 mt-2">{apartment.title}</span>
        </h2>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Show selected dates and price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-gray-600">Datum prijave</p>
            <p className="font-semibold">{checkInDateObj ? toLocalDateString(checkInDateObj) : '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Datum odjave</p>
            <p className="font-semibold">{checkOutDateObj ? toLocalDateString(checkOutDateObj) : '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Ukupna cijena</p>
            <p className="font-semibold">{totalPrice ? `${totalPrice} €` : '-'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broj gostiju
              </label>
              <input
                type="number"
                name="guests_number"
                value={formData.guests_number}
                onChange={handleChange}
                min="1"
                max={apartment.max_guests}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ime
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prezime
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Rezerviraj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingForm; 