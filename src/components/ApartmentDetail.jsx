import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function ApartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [selectedDates, setSelectedDates] = useState({
    startDate: null,
    endDate: null
  });
  const [bookingError, setBookingError] = useState('');

  // Helper function to format image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL}/${imageUrl.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/apartments/${id}`);
        setApartment(response.data);
        await fetchAvailability();
        setLoading(false);
      } catch (err) {
        console.error('Error fetching apartment:', err);
        setError('Error fetching apartment details');
        setLoading(false);
      }
    };

    fetchApartment();
  }, [id]);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/apartments/${id}/monthly-availability`);
      setAvailabilityData(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setSelectedDates({ startDate: start, endDate: end });
    setBookingError('');
  };

  // Helper to format date as YYYY-MM-DD in local time
  const toLocalDateString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedDates.startDate || !selectedDates.endDate) {
      setBookingError('Molimo odaberite datume prijave i odjave');
      return;
    }

    try {
      // Check availability for selected dates
      const response = await axios.get(`${API_URL}/api/apartments/${id}/availability`, {
        params: {
          check_in_date: toLocalDateString(selectedDates.startDate),
          check_out_date: toLocalDateString(selectedDates.endDate)
        }
      });

      if (!response.data.available) {
        setBookingError(response.data.message);
        return;
      }

      // Calculate total price
      const days = Math.ceil((selectedDates.endDate - selectedDates.startDate) / (1000 * 60 * 60 * 24));
      const totalPrice = Number((days * apartment.price).toFixed(2));

      // Navigate to booking form with pre-filled dates
      navigate(`/apartments/${id}/book`, {
        state: {
          checkInDate: toLocalDateString(selectedDates.startDate),
          checkOutDate: toLocalDateString(selectedDates.endDate),
          totalPrice: totalPrice
        }
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      setBookingError('Greška pri provjeri dostupnosti. Molimo pokušajte ponovno.');
    }
  };

  // Helper function to parse amenities
  const parseAmenities = (amenitiesData) => {
    if (!amenitiesData) return [];
    if (Array.isArray(amenitiesData)) return amenitiesData;
    
    try {
      return JSON.parse(amenitiesData);
    } catch (e) {
      return amenitiesData.split(',').map(item => item.trim()).filter(Boolean);
    }
  };

  // Helper function to check if a date is available
  const isDateAvailable = (date) => {
    if (!availabilityData) return true;
    const dateStr = date.toISOString().split('T')[0];
    return availabilityData[dateStr] !== false && date >= new Date(new Date().setHours(0,0,0,0));
  };

  // Helper function to get color for a date
  const getDayColor = (date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) return 'text-gray-400'; // past
    if (date.toDateString() === today.toDateString()) return 'text-gray-400'; // today
    const dateStr = date.toISOString().split('T')[0];
    if (availabilityData && availabilityData[dateStr] === false) return 'text-red-600'; // booked
    if (availabilityData && availabilityData[dateStr] === true) return 'text-green-600'; // available
    return 'text-gray-400'; // fallback
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <button
            onClick={() => navigate('/apartments')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Povratak na listu apartmana
          </button>
        </div>
      </div>
    );
  }

  const amenities = parseAmenities(apartment.amenities);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/apartments')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Povratak na listu apartmana
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left column - Image */}
          <div>
            <div className="relative h-96 mb-4 rounded-lg overflow-hidden shadow-lg">
              <img
                src={getImageUrl(apartment.image_url)}
                alt={apartment.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image';
                }}
              />
            </div>
          </div>

          {/* Right column - Details */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{apartment.title}</h1>
            <p className="text-gray-600 mb-6">📍 {apartment.location}</p>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Cijena po noćenju</p>
                  <p className="text-2xl font-bold text-blue-600">{apartment.price} €</p>
                </div>
                <div>
                  <p className="text-gray-600">Veličina</p>
                  <p className="text-2xl font-bold">{apartment.size} m²</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Spavaće sobe</p>
                  <p className="text-xl font-semibold">{apartment.bedrooms}</p>
                </div>
                <div>
                  <p className="text-gray-600">Kupaonice</p>
                  <p className="text-xl font-semibold">{apartment.bathrooms}</p>
                </div>
                <div>
                  <p className="text-gray-600">Max. gostiju</p>
                  <p className="text-xl font-semibold">{apartment.max_guests}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Opis</h3>
                <p className="text-gray-600">{apartment.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Pogodnosti</h3>
                <div className="grid grid-cols-2 gap-2">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability Calendar */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Rezervacija</h3>
              <div className="flex justify-center">
                <DatePicker
                  selected={selectedDates.startDate}
                  onChange={handleDateChange}
                  startDate={selectedDates.startDate}
                  endDate={selectedDates.endDate}
                  selectsRange
                  inline
                  monthsShown={2}
                  minDate={new Date()}
                  maxDate={new Date(new Date().setMonth(new Date().getMonth() + 6))}
                  filterDate={date => isDateAvailable(date)}
                  renderDayContents={(day, date) => {
                    const colorClass = getDayColor(date);
                    return (
                      <div className={`p-1 ${colorClass}`}>{day}</div>
                    );
                  }}
                />
              </div>
              <div className="mt-4 flex items-center justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Dostupno</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-500 rounded mr-2"></div>
                  <span className="text-sm text-gray-600">Zauzeto</span>
                </div>
              </div>

              {bookingError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-center">{bookingError}</p>
                </div>
              )}

              {selectedDates.startDate && selectedDates.endDate && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-center text-blue-800">
                    Odabrani period: {toLocalDateString(selectedDates.startDate)} - {toLocalDateString(selectedDates.endDate)}
                  </p>
                  <p className="text-center text-blue-800 mt-2">
                    Ukupno noćenja: {Math.ceil((selectedDates.endDate - selectedDates.startDate) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-center text-blue-800 mt-2">
                    Ukupna cijena: {(Math.ceil((selectedDates.endDate - selectedDates.startDate) / (1000 * 60 * 60 * 24)) * apartment.price).toFixed(2)} €
                  </p>
                </div>
              )}

              <button
                onClick={handleBooking}
                className="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                disabled={!selectedDates.startDate || !selectedDates.endDate}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {user ? 'Rezerviraj odabrane datume' : 'Prijavi se za rezervaciju'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApartmentDetail; 