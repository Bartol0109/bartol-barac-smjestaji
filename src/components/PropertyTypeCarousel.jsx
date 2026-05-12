import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const propertyTypes = [
  {
    title: 'Hoteli',
    image: '/images/hotel.jpg',
  },
  {
    title: 'Apartmani',
    image: '/images/apartment.jpg',
  },
  {
    title: 'Resorti',
    image: '/images/resort.jpg',
  },
  {
    title: 'Vile',
    image: '/images/villa.jpg',
  },
];

const PropertyTypeCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <div style={{ color: 'white' }}>→</div>,
    prevArrow: <div style={{ color: 'white' }}>←</div>,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-white">Pretraži po vrsti objekta</h2>
      <Slider {...settings}>
        {propertyTypes.map((type, index) => (
          <div key={index} className="px-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
              <div className="relative h-64">
                <img
                  src={type.image}
                  alt={type.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-center text-white">{type.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default PropertyTypeCarousel; 