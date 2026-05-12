import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ApartmentList from './components/ApartmentList';
import ApartmentDetail from './components/ApartmentDetail';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import UnavailableApartment from './components/UnavailableApartment';
import BookingsList from './components/BookingsList';
import Contact from './components/Contact';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/apartments" element={<ApartmentList />} />
              <Route path="/apartments/:id" element={<ApartmentDetail />} />
              <Route 
                path="/apartments/:id/book" 
                element={
                  <PrivateRoute>
                    <BookingForm />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/booking-confirmation" 
                element={
                  <PrivateRoute>
                    <BookingConfirmation />
                  </PrivateRoute>
                } 
              />
              <Route path="/unavailable-apartment" element={<UnavailableApartment />} />
              <Route 
                path="/bookings" 
                element={
                  <PrivateRoute>
                    <BookingsList />
                  </PrivateRoute>
                } 
              />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;