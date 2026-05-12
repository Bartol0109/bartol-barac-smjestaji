import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Log the request details
      console.log('Login request:', {
        url: `${API_URL}/api/auth/login`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: formData
      });

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      // Log the complete response
      console.log('Login response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });

      if (!response.ok) {
        throw new Error(data.message || 'Greška pri prijavi');
      }

      if (!data.token || !data.user) {
        throw new Error('Neispravni podaci za prijavu');
      }

      login(data);
      navigate('/apartments');
    } catch (err) {
      console.error('Login error:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'Došlo je do greške prilikom prijave. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      console.log('Form data updated:', updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Prijavi se u svoj račun
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ili{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            registriraj se ako nemaš račun
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email adresa
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Lozinka
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Prijava u tijeku...' : 'Prijavi se'}
              </button>
            </div>
          </form>

          {/* Test admin credentials */}
          <div className="mt-6 bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">Test admin račun:</p>
            <p className="text-sm text-gray-800">Email: admin@example.com</p>
            <p className="text-sm text-gray-800">Lozinka: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;