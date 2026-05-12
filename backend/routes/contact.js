const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/contact - Send contact form email
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validacija podataka
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: 'Sva polja su obavezna' 
      });
    }

    // Kreiranje transporter-a za Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hoolidayinc@gmail.com',
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email za admina
    const adminMailOptions = {
      from: 'hoolidayinc@gmail.com',
      to: 'hoolidayinc@gmail.com',
      subject: `Nova poruka sa web stranice: ${subject}`,
      html: `
        <h3>Nova poruka sa kontakt forme</h3>
        <p><strong>Ime:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Predmet:</strong> ${subject}</p>
        <p><strong>Poruka:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Poruka poslana sa web stranice HoolidayInc</small></p>
      `,
      text: `
Nova poruka sa kontakt forme

Ime: ${name}
Email: ${email}
Predmet: ${subject}

Poruka:
${message}

---
Poruka poslana sa web stranice HoolidayInc
      `
    };

    // Email potvrde za korisnika
    const userMailOptions = {
      from: 'hoolidayinc@gmail.com',
      to: email,
      subject: 'Potvrda primitka poruke - HoolidayInc',
      html: `
        <h3>Poštovani ${name},</h3>
        <p>Hvala vam na poruci! Vaša poruka je uspješno zaprimljena.</p>
        <p><strong>Predmet:</strong> ${subject}</p>
        <p><strong>Vaša poruka:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p>Odgovorit ćemo vam u najkraćem mogućem roku.</p>
        <hr>
        <p><small>Ovo je automatska potvrda. Molimo ne odgovarajte na ovaj email.</small></p>
      `,
      text: `
Poštovani ${name},

Hvala vam na poruci! Vaša poruka je uspješno zaprimljena.

Predmet: ${subject}

Vaša poruka:
${message}

Odgovorit ćemo vam u najkraćem mogućem roku.

---
Ovo je automatska potvrda. Molimo ne odgovarajte na ovaj email.
      `
    };

    // Slanje emailova
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    console.log('Email uspješno poslan:', { name, email, subject });

    res.status(200).json({ 
      message: 'Poruka je uspješno poslana! Odgovorit ćemo vam u najkraćem mogućem roku.' 
    });

  } catch (error) {
    console.error('Greška pri slanju emaila:', error);
    res.status(500).json({ 
      message: 'Greška pri slanju poruke. Molimo pokušajte ponovno.' 
    });
  }
});

module.exports = router; 