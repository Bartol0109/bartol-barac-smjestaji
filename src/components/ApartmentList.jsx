import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

function ApartmentList() {
  const { user } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    seller_email: '',
    location: '',
    price: '',
    size: '',
    rooms: '',
    bedrooms: '',
    bathrooms: '',
    max_guests: '',
    description: '',
    amenities: '',
    available_units: '',
    property_type: 'apartman',
    image: null
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Helper function to format image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL}/${imageUrl.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    // Filter apartments based on search term and property type
    const filtered = apartments.filter(apartment => {
      const matchesSearch = apartment.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = propertyType === 'all' || apartment.property_type === propertyType;
      return matchesSearch && matchesType;
    });
    setFilteredApartments(filtered);
  }, [searchTerm, propertyType, apartments]);

  const fetchApartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/apartments`);
      setApartments(response.data);
    } catch (err) {
      console.error('Error fetching apartments:', err);
      setError('Error fetching apartments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image') {
        if (formData[key]) {
          formDataToSend.append('image', formData[key]);
        }
      } else if (key === 'amenities') {
        // Handle amenities as a string directly
        formDataToSend.append('amenities', formData[key]);
      } else if (['price', 'size', 'rooms', 'bedrooms', 'bathrooms', 'max_guests', 'available_units'].includes(key)) {
        // Convert numeric fields to numbers
        formDataToSend.append(key, Number(formData[key]) || 0);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${API_URL}/api/apartments`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setMessage('Smještaj je uspješno dodan!');
        setFormData({
          title: '',
          seller_email: '',
          location: '',
          price: '',
          size: '',
          rooms: '',
          bedrooms: '',
          bathrooms: '',
          max_guests: '',
          description: '',
          amenities: '',
          available_units: '',
          property_type: 'apartman',
          image: null
        });
        fetchApartments(); // Refresh the list
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error adding apartment:', err.response?.data || err);
      setError(err.response?.data?.message || 'Došlo je do greške prilikom dodavanja smještaja.');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeste li sigurni da želite obrisati ovaj smještaj?')) {
      try {
        await axios.delete(`${API_URL}/api/apartments/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setMessage('Smještaj je uspješno obrisan!');
        fetchApartments(); // Refresh the list
      } catch (err) {
        console.error('Error deleting apartment:', err);
        setError('Greška prilikom brisanja smještaja.');
      }
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filter Section */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Pretraži po nazivu
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Unesite naziv smještaja..."
              />
            </div>
            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Tip smještaja
              </label>
              <select
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Svi tipovi</option>
                <option value="apartman">Apartman</option>
                <option value="vila">Vila</option>
                <option value="hotel">Hotel</option>
              </select>
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 mb-4"
            >
              {showForm ? 'Zatvori formu' : 'Dodaj novi smještaj'}
            </button>

            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {showForm && (
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8 transform transition-all duration-300 ease-in-out">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Dodaj novi smještaj</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Osnovne informacije */}
                  <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Osnovne informacije</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Naziv smještaja</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite naziv smještaja"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tip smještaja</label>
                        <select
                          name="property_type"
                          value={formData.property_type}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        >
                          <option value="apartman">Apartman</option>
                          <option value="vila">Vila</option>
                          <option value="hotel">Hotel</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email prodavača</label>
                        <input
                          type="email"
                          name="seller_email"
                          value={formData.seller_email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="email@primjer.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Lokacija</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite lokaciju"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Cijena po noći (€)</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite cijenu"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Karakteristike smještaja */}
                  <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Karakteristike smještaja</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Površina (m²)</label>
                        <input
                          type="number"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          required
                          min="0"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite površinu"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Broj soba</label>
                        <input
                          type="number"
                          name="rooms"
                          value={formData.rooms}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite broj soba"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Broj spavaćih soba</label>
                        <input
                          type="number"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite broj spavaćih soba"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Broj kupaonica</label>
                        <input
                          type="number"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite broj kupaonica"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Maksimalni broj gostiju</label>
                        <input
                          type="number"
                          name="max_guests"
                          value={formData.max_guests}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite maksimalni broj gostiju"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Dostupne jedinice</label>
                        <input
                          type="number"
                          name="available_units"
                          value={formData.available_units}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite broj dostupnih jedinica"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Opis i pogodnosti */}
                  <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Opis i pogodnosti</h4>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Opis smještaja</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          rows="4"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite detaljan opis smještaja"
                        ></textarea>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Dodatne pogodnosti</label>
                        <input
                          type="text"
                          name="amenities"
                          value={formData.amenities}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                          placeholder="Unesite dodatne pogodnosti odvojene zarezom"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Slika */}
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Slika smještaja</h4>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Odaberite sliku</label>
                      <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        accept="image/*"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition duration-200"
                    >
                      Odustani
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
                    >
                      Dodaj smještaj
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        <h2 className="text-3xl font-bold text-center mb-12">Dostupni smještaji</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredApartments.map((apartment) => (
            <div key={apartment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48">
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
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{apartment.title}</h3>
                <p className="text-gray-600 mb-4">📍 {apartment.location}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">🛏️ {apartment.rooms} sobe</span>
                  <span className="text-sm text-gray-500">📐 {apartment.size} m²</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">🏠 {apartment.available_units} {apartment.available_units === 1 ? 'jedinica' : 'jedinice'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">{apartment.price} €</span>
                  <div className="flex gap-2">
                    <Link
                      to={`/apartments/${apartment.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                    >
                    Detalji
                    </Link>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(apartment.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
                      >
                        Ukloni
                  </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ApartmentList;