import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSwimmingPool, FaWifi, FaParking, FaCocktail } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../config';

function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [featuredApartments, setFeaturedApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL}/${imageUrl.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/apartments`);
        // Uzmi prva 3 apartmana za featured sekciju
        setFeaturedApartments(response.data.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching apartments:', error);
        setError('Greška pri učitavanju smještaja');
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  const heroImages = [
    '/images/apartment.jpg',
    '/images/hotel.jpg',
    '/images/resort.jpg',
    '/images/villa.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Mijenja sliku svakih 5 sekundi

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const features = [
    {
      icon: <FaSwimmingPool className="w-8 h-8" />,
      title: 'Bazen',
      description: 'Uživajte u osvježavajućem bazenu tijekom vrućih ljetnih dana'
    },
    {
      icon: <FaWifi className="w-8 h-8" />,
      title: 'Besplatni WiFi',
      description: 'Brza internet veza dostupna u svim smještajima'
    },
    {
      icon: <FaParking className="w-8 h-8" />,
      title: 'Parking',
      description: 'Osigurano parkirno mjesto za sve goste'
    },
    {
      icon: <FaCocktail className="w-8 h-8" />,
      title: 'Bar',
      description: 'Opustite se uz piće u našem lounge baru'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] overflow-hidden">
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Hero Image ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Pronađite savršen smještaj za vaš odmor
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Luksuzni apartmani, vile i hoteli na najboljim lokacijama
            </p>
            <Link
              to="/apartments"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition duration-300"
            >
              Pretraži smještaje
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Apartments Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Izdvojeni smještaji</h2>
          
          {loading ? (
            <div className="text-center">Učitavanje...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredApartments.map((apartment) => (
                <div 
                  key={apartment.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition duration-300"
                >
                  <div className="relative h-64">
                    <img 
                      src={getImageUrl(apartment.image_url)}
                      alt={apartment.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image';
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white text-xl font-semibold">{apartment.title}</h3>
                      <p className="text-white/80">{apartment.location}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{apartment.price}€ / noć</span>
                      <Link 
                        to={`/apartments/${apartment.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Više informacija
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* About Us Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">O nama</h2>
            <p className="text-xl text-gray-600">Vaš partner za nezaboravna putovanja</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <p className="mb-4 text-lg text-gray-700">
                Dobrodošli u HoolidayInc, gdje strast prema putovanjima susreće besprijekornu uslugu. Osnovani s vizijom pružanja vrhunskog smještaja, pažljivo biramo svaku nekretninu kako bismo osigurali da vaš boravak bude ništa manje od savršenog.
              </p>
              <p className="mb-4 text-lg text-gray-700">
                Naša ponuda uključuje luksuzne apartmane, elegantne vile i vrhunske hotele na najtraženijim lokacijama. Svaka nekretnina u našem portfelju prolazi strogu selekciju kako bi zadovoljila naše visoke standarde kvalitete, udobnosti i jedinstvenosti.
              </p>
              <p className="mb-4 text-lg text-gray-700">
                U HoolidayInc vjerujemo da su detalji bitni. Zato se posvećujemo pružanju personalizirane usluge i podrške od trenutka kada započnete svoju potragu pa sve do završetka vašeg boravka. Naš cilj je nadmašiti vaša očekivanja i stvoriti uspomene koje će trajati cijeli život.
              </p>
              <p className="text-lg text-gray-700">
                Pridružite se zajednici zadovoljnih putnika i dopustite nam da budemo vaš vodič u svijetu luksuznog smještaja. Istražite našu ponudu danas i pronađite svoje savršeno mjesto za odmor iz snova.
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/images/Onama.jpg"
                alt="O nama" 
                className="rounded-lg shadow-lg object-cover w-full h-64 md:h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;