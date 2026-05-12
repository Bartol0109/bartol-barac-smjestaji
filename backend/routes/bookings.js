const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Get all bookings for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('Fetching bookings for user:', req.user.id);
    const result = await db.execute(`
      SELECT 
        b.*,
        a.title as apartment_title,
        a.location,
        a.image_url,
        a.price as apartment_price
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    const bookings = result[0];
    console.log('Found bookings:', bookings);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { 
      apartment_id, 
      check_in_date, 
      check_out_date, 
      guests_number,
      first_name,
      last_name,
      email 
    } = req.body;

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();

    if (checkIn < today) {
      return res.status(400).json({ message: 'Datum prijave ne može biti u prošlosti' });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({ message: 'Datum odjave mora biti nakon datuma prijave' });
    }

    // Get apartment price
    const [apartments] = await db.execute(
      'SELECT price FROM apartments WHERE id = ?',
      [apartment_id]
    );

    if (apartments.length === 0) {
      return res.status(404).json({ message: 'Apartman nije pronađen' });
    }

    // Calculate number of nights
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const total_price = Number((apartments[0].price * nights).toFixed(2));

    // Check apartment availability
    const [availability] = await db.execute(`
      SELECT a.available_units, COUNT(b.id) as booked_units
      FROM apartments a
      LEFT JOIN bookings b ON a.id = b.apartment_id 
        AND b.status = 'confirmed'
        AND (
          (b.check_in_date <= ? AND b.check_out_date > ?) OR
          (b.check_in_date < ? AND b.check_out_date >= ?) OR
          (b.check_in_date >= ? AND b.check_out_date <= ?)
        )
      WHERE a.id = ?
      GROUP BY a.id
    `, [checkOut, checkIn, checkOut, checkIn, checkIn, checkOut, apartment_id]);

    if (availability.length === 0) {
      return res.status(404).json({ message: 'Apartman nije pronađen' });
    }

    const { available_units, booked_units } = availability[0];
    if (booked_units >= available_units) {
      return res.status(400).json({ message: 'Nažalost, apartman nije dostupan za odabrane datume' });
    }

    // Create booking
    const [result] = await db.execute(`
      INSERT INTO bookings (
        user_id, 
        apartment_id, 
        check_in_date, 
        check_out_date, 
        guests_number, 
        total_price, 
        status,
        first_name,
        last_name,
        email
      ) VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)
    `, [
      req.user.id, 
      apartment_id, 
      check_in_date, 
      check_out_date, 
      guests_number, 
      total_price,
      first_name,
      last_name,
      email
    ]);

    // Get the created booking with apartment details
    const [bookings] = await db.execute(`
      SELECT b.*, a.title as apartment_title, a.location, a.image_url, a.seller_email
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      WHERE b.id = ?
    `, [result.insertId]);

    // Slanje emaila korisniku, adminu i vlasniku smještaja
    const booking = bookings[0];
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hoolidayinc@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Email za korisnika
    const mailOptionsUser = {
      from: 'hoolidayinc@gmail.com',
      to: booking.email,
      subject: 'Potvrda rezervacije - ' + booking.apartment_title,
      text: `Poštovani ${booking.first_name} ${booking.last_name},\n\nVaša rezervacija je uspješno zaprimljena!\n\nApartman: ${booking.apartment_title}\nLokacija: ${booking.location}\nCheck-in: ${booking.check_in_date}\nCheck-out: ${booking.check_out_date}\nBroj gostiju: ${booking.guests_number}\nUkupna cijena: ${booking.total_price} €\n\nHvala na povjerenju!`,
      html: `<h3>Poštovani ${booking.first_name} ${booking.last_name},</h3><p>Vaša rezervacija je uspješno zaprimljena!</p><ul><li><b>Apartman:</b> ${booking.apartment_title}</li><li><b>Lokacija:</b> ${booking.location}</li><li><b>Check-in:</b> ${booking.check_in_date}</li><li><b>Check-out:</b> ${booking.check_out_date}</li><li><b>Broj gostiju:</b> ${booking.guests_number}</li><li><b>Ukupna cijena:</b> ${booking.total_price} €</li></ul><p>Hvala na povjerenju!</p>`
    };
    
    // Email za admina
    const mailOptionsAdmin = {
      from: 'hoolidayinc@gmail.com',
      to: 'hoolidayinc@gmail.com',
      subject: 'Nova rezervacija - ' + booking.apartment_title,
      text: `Nova rezervacija:\n\nApartman: ${booking.apartment_title}\nLokacija: ${booking.location}\nCheck-in: ${booking.check_in_date}\nCheck-out: ${booking.check_out_date}\nBroj gostiju: ${booking.guests_number}\nIme gosta: ${booking.first_name} ${booking.last_name}\nEmail gosta: ${booking.email}\nUkupna cijena: ${booking.total_price} €`,
      html: `<h3>Nova rezervacija</h3><ul><li><b>Apartman:</b> ${booking.apartment_title}</li><li><b>Lokacija:</b> ${booking.location}</li><li><b>Check-in:</b> ${booking.check_in_date}</li><li><b>Check-out:</b> ${booking.check_out_date}</li><li><b>Broj gostiju:</b> ${booking.guests_number}</li><li><b>Ime gosta:</b> ${booking.first_name} ${booking.last_name}</li><li><b>Email gosta:</b> ${booking.email}</li><li><b>Ukupna cijena:</b> ${booking.total_price} €</li></ul>`
    };
    
    // Email za vlasnika smještaja
    const mailOptionsOwner = {
      from: 'hoolidayinc@gmail.com',
      to: booking.seller_email,
      subject: 'Nova rezervacija vašeg smještaja - ' + booking.apartment_title,
      text: `Poštovani,\n\nImate novu rezervaciju vašeg smještaja!\n\nApartman: ${booking.apartment_title}\nLokacija: ${booking.location}\nCheck-in: ${booking.check_in_date}\nCheck-out: ${booking.check_out_date}\nBroj gostiju: ${booking.guests_number}\nIme gosta: ${booking.first_name} ${booking.last_name}\nEmail gosta: ${booking.email}\nUkupna cijena: ${booking.total_price} €\n\nRezervacija je napravljena putem HoolidayInc aplikacije.\n\nHvala!`,
      html: `
        <h3>Poštovani,</h3>
        <p>Imate novu rezervaciju vašeg smještaja!</p>
        <ul>
          <li><b>Apartman:</b> ${booking.apartment_title}</li>
          <li><b>Lokacija:</b> ${booking.location}</li>
          <li><b>Check-in:</b> ${booking.check_in_date}</li>
          <li><b>Check-out:</b> ${booking.check_out_date}</li>
          <li><b>Broj gostiju:</b> ${booking.guests_number}</li>
          <li><b>Ime gosta:</b> ${booking.first_name} ${booking.last_name}</li>
          <li><b>Email gosta:</b> ${booking.email}</li>
          <li><b>Ukupna cijena:</b> ${booking.total_price} €</li>
        </ul>
        <p><strong>Rezervacija je napravljena putem HoolidayInc aplikacije.</strong></p>
        <p>Hvala!</p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptionsUser);
      await transporter.sendMail(mailOptionsAdmin);
      await transporter.sendMail(mailOptionsOwner);
      console.log('Emailovi uspješno poslani korisniku, adminu i vlasniku smještaja');
    } catch (mailError) {
      console.error('Greška pri slanju emaila:', mailError);
    }

    res.status(201).json(bookings[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Cancel a booking
router.post('/:id/cancel', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    // Start a transaction
    await connection.beginTransaction();

    // Get the booking details
    const [bookings] = await connection.execute(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Rezervacija nije pronađena' });
    }

    const booking = bookings[0];

    // Update booking status to cancelled
    await connection.execute(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [req.params.id]
    );

    // Commit the transaction
    await connection.commit();

    res.json({ message: 'Rezervacija je otkazana' });
  } catch (error) {
    // If there's an error, rollback the transaction
    await connection.rollback();
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
});

// Delete a cancelled booking
router.delete('/:id', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    // Start a transaction
    await connection.beginTransaction();

    // Get the booking details
    const [bookings] = await connection.execute(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND status = "cancelled"',
      [req.params.id, req.user.id]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        message: 'Rezervacija nije pronađena ili nije otkazana' 
      });
    }

    // Delete the booking
    await connection.execute(
      'DELETE FROM bookings WHERE id = ?',
      [req.params.id]
    );

    // Commit the transaction
    await connection.commit();

    res.json({ message: 'Rezervacija je uspješno obrisana' });
  } catch (error) {
    // If there's an error, rollback the transaction
    await connection.rollback();
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking', error: error.message });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
});

module.exports = router; 