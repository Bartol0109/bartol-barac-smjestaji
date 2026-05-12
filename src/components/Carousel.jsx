import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const slides = [
  {
    id: 1,
    title: "Luksuzni Penthouse",
    location: "Centar grada",
    price: "€450,000",
    description: "Prekrasan penthouse s panoramskim pogledom na grad",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000",
    features: ["3 spavaće sobe", "2 kupaonice", "200m²", "Parking"]
  },
  {
    id: 2,
    title: "Moderna Loft",
    location: "Stari grad",
    price: "€380,000",
    description: "Otvoreni prostor s industrijskim elementima",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000",
    features: ["2 spavaće sobe", "1 kupaonica", "150m²", "Balkon"]
  },
  {
    id: 3,
    title: "Seoski Apartman",
    location: "Predgrađe",
    price: "€320,000",
    description: "Mirno mjesto s velikim vrtom",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000",
    features: ["2 spavaće sobe", "1 kupaonica", "180m²", "Vrt"]
  }
];

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full mb-20">
      {/* Slides Container */}
      <div className="relative w-full h-[600px] md:h-[500px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`w-full absolute inset-0 transition-all duration-500 ease-in-out transform
              ${index === currentIndex ? 'translate-x-0 opacity-100' : 
                index < currentIndex ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'}`}
            style={{
              transitionDelay: index === currentIndex ? '0ms' : '0ms',
              zIndex: index === currentIndex ? 10 : 0
            }}
          >
            <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                {/* Image side */}
                <div className="relative h-64 md:h-full">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content side */}
                <div className="p-6 flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                    <p className="text-gray-600 mb-2">{slide.location}</p>
                    <p className="text-3xl font-bold text-blue-600 mb-4">{slide.price}</p>
                    <p className="text-gray-700 mb-6">{slide.description}</p>
                    
                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4">
                      {slide.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-gray-600">
                          <span className="mr-2">•</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details Button */}
                  <div className="flex justify-end mt-4">
                    <button
                      className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      Detalji
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors z-20"
      >
        <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors z-20"
      >
        <ChevronRightIcon className="h-6 w-6 text-gray-800" />
      </button>

      {/* Dots indicator */}
      <div className="flex justify-center space-x-2 mt-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel; 