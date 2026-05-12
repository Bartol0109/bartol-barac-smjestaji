import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kontaktirajte nas</h1>
          <p className="text-lg text-gray-600">Imate pitanja? Tu smo za vas!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Ime i prezime
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Predmet
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Poruka
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
              >
                {isSubmitting ? 'Slanje...' : 'Pošalji poruku'}
              </button>

              {submitStatus === 'success' && (
                <div className="text-green-600 text-center mt-4">
                  Poruka je uspješno poslana!
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="text-red-600 text-center mt-4">
                  Došlo je do greške prilikom slanja poruke. Molimo pokušajte ponovno.
                </div>
              )}
            </form>
          </div>

          {/* Map and Contact Info */}
          <div className="space-y-8">
            {/* Google Map */}
            <div className="h-[300px] rounded-xl overflow-hidden shadow-lg">
              <iframe
                title="location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2889.9796663722657!2d15.231824776882712!3d44.11381727107036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4761fa62d4b5539f%3A0x3236b2478fb65def!2sUl.+Marka+Maruli%C4%87a+20%2C+23000%2C+Zadar!5e0!3m2!1sen!2shr!4v1565432709852"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Kontakt informacije</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-blue-600 text-xl mt-1 mr-4" />
                  <div>
                    <p className="font-medium">Adresa</p>
                    <p className="text-gray-600">Ul. Marka Marulića 20</p>
                    <p className="text-gray-600">23000 Zadar</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaPhone className="text-blue-600 text-xl mt-1 mr-4" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-gray-600">+385 23 123 456</p>
                    <p className="text-gray-600">+385 91 234 5678</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaEnvelope className="text-blue-600 text-xl mt-1 mr-4" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">infohoolidayinc@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 