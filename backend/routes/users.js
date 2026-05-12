const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// GET /api/users/me - Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Greška pri dohvaćanju korisnika' });
  }
});

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Provjeri postoji li već korisnik s tim emailom
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email je već registriran' });
    }

    // Hash lozinke
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Spremi novog korisnika
    const [result] = await db.execute(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, "user")',
      [email, hashedPassword, first_name, last_name]
    );

    // Kreiraj JWT token
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registracija uspješna',
      user: {
        id: result.insertId,
        email,
        first_name,
        last_name,
        role: 'user'
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Greška pri registraciji' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Dohvati korisnika
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Pogrešan email ili lozinka' });
    }

    const user = users[0];

    // Provjeri lozinku
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Pogrešan email ili lozinka' });
    }

    // Kreiraj JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Ne šalji lozinku natrag
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Prijava uspješna',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Greška pri prijavi' });
  }
});

module.exports = router; 