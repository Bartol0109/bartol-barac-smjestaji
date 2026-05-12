const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const BASE_URL = `http://localhost:${process.env.PORT || 5001}`;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a clean filename
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50); // Limit name length
    const filename = `${timestamp}-${cleanName}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve static files from uploads directory
router.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// GET all apartments
router.get('/', async (req, res) => {
  try {
    const [apartments] = await db.execute('SELECT * FROM apartments');
    
    // Update image URLs for all apartments
    apartments.forEach(apartment => {
      if (apartment.image_url) {
        if (apartment.image_url.startsWith('http')) {
          // If it's already a full URL, keep it as is
          apartment.image_url = apartment.image_url;
        } else if (apartment.image_url.startsWith('/')) {
          // If it starts with a slash, prepend the base URL
          apartment.image_url = `${BASE_URL}${apartment.image_url}`;
        } else {
          // Otherwise, prepend the base URL and a slash
          apartment.image_url = `${BASE_URL}/${apartment.image_url}`;
        }
      }
    });

    res.json(apartments);
  } catch (error) {
    console.error('Error fetching apartments:', error);
    res.status(500).json({ message: 'Error fetching apartments', error: error.message });
  }
});

// GET single apartment with availability check
router.get('/:id', async (req, res, next) => {
  try {
    console.log(`Fetching apartment with ID: ${req.params.id}`);
    const [results] = await db.execute('SELECT * FROM apartments WHERE id = ?', [req.params.id]);
    
    if (results.length === 0) {
      console.log('Apartment not found');
      return res.status(404).json({ message: 'Apartment not found' });
    }
    
    const apartment = results[0];
    console.log('Found apartment:', apartment);

    // Get current bookings for availability check
    const [bookings] = await db.execute(`
      SELECT COUNT(*) as active_bookings
      FROM bookings 
      WHERE apartment_id = ? 
      AND status = 'confirmed'
      AND check_out_date > CURRENT_DATE()
    `, [req.params.id]);

    console.log('Active bookings:', bookings[0]);

    // Calculate current availability
    apartment.current_availability = apartment.available_units - bookings[0].active_bookings;
    
    // Update image URL to use the correct base URL
    if (apartment.image_url) {
      if (apartment.image_url.startsWith('http')) {
        // If it's already a full URL, keep it as is
        apartment.image_url = apartment.image_url;
      } else if (apartment.image_url.startsWith('/')) {
        // If it starts with a slash, prepend the base URL
        apartment.image_url = `${BASE_URL}${apartment.image_url}`;
      } else {
        // Otherwise, prepend the base URL and a slash
        apartment.image_url = `${BASE_URL}/${apartment.image_url}`;
      }
    }
    
    console.log('Sending response with apartment:', apartment);
    res.json(apartment);
  } catch (error) {
    console.error('Error fetching apartment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching apartment', error: error.message });
  }
});

// Check apartment availability for specific dates
router.get('/:id/availability', async (req, res) => {
  try {
    const { check_in_date, check_out_date } = req.query;
    const apartmentId = req.params.id;

    console.log('Checking availability for:', {
      apartmentId,
      check_in_date,
      check_out_date
    });

    if (!check_in_date || !check_out_date) {
      return res.status(400).json({
        available: false,
        message: 'Potrebno je odabrati datume prijave i odjave'
      });
    }

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Parsed dates:', {
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      today: today.toISOString()
    });

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        available: false,
        message: 'Neispravan format datuma'
      });
    }

    if (checkIn < today) {
      return res.status(400).json({
        available: false,
        message: 'Datum prijave ne može biti u prošlosti'
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        available: false,
        message: 'Datum odjave mora biti nakon datuma prijave'
      });
    }

    // Get apartment and check availability
    const [apartments] = await db.execute(
      'SELECT available_units FROM apartments WHERE id = ?',
      [apartmentId]
    );

    if (apartments.length === 0) {
      return res.status(404).json({
        available: false,
        message: 'Apartman nije pronađen'
      });
    }

    // Check existing bookings for the selected period
    const [bookings] = await db.execute(`
      SELECT COUNT(*) as booked_units
      FROM bookings 
      WHERE apartment_id = ? 
      AND status = 'confirmed'
      AND (
        (check_in_date < ? AND check_out_date > ?)
      )
    `, [
      apartmentId,
      checkOut.toISOString().split('T')[0],
      checkIn.toISOString().split('T')[0],
    ]);

    console.log('Availability check results:', {
      availableUnits: apartments[0].available_units,
      bookedUnits: bookings[0].booked_units
    });

    const availableUnits = apartments[0].available_units - bookings[0].booked_units;
    const isAvailable = availableUnits > 0;

    return res.json({
      available: isAvailable,
      message: isAvailable 
        ? `Apartman je dostupan za odabrane datume (${availableUnits} jedinica dostupno)`
        : 'Nažalost, apartman nije dostupan za odabrane datume'
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      available: false,
      message: 'Greška pri provjeri dostupnosti'
    });
  }
});

// Get monthly availability for an apartment
router.get('/:id/monthly-availability', async (req, res) => {
  const { id } = req.params;
  const today = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  try {
    // Get available_units for the apartment
    const [apartments] = await db.execute(
      'SELECT available_units FROM apartments WHERE id = ?',
      [id]
    );
    if (apartments.length === 0) {
      return res.status(404).json({ message: 'Apartman nije pronađen' });
    }
    const availableUnits = apartments[0].available_units;

    // Get all confirmed bookings for the next 6 months
    const [bookings] = await db.execute(
      `SELECT check_in_date, check_out_date 
       FROM bookings 
       WHERE apartment_id = ? 
       AND status = 'confirmed'
       AND check_out_date >= ? 
       AND check_in_date <= ?`,
      [id, today.toISOString().split('T')[0], sixMonthsFromNow.toISOString().split('T')[0]]
    );

    // Create a map to count bookings per date
    const bookingCount = {};
    bookings.forEach(booking => {
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        const dateStr = currentDate.toISOString().split('T')[0];
        bookingCount[dateStr] = (bookingCount[dateStr] || 0) + 1;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Create availability map
    const availability = {};
    const currentDate = new Date(today);
    while (currentDate <= sixMonthsFromNow) {
      const dateStr = currentDate.toISOString().split('T')[0];
      // Mark unavailable only if bookings >= availableUnits
      availability[dateStr] = (bookingCount[dateStr] || 0) < availableUnits;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json(availability);
  } catch (error) {
    console.error('Error fetching monthly availability:', error);
    res.status(500).json({ message: 'Greška pri dohvatu dostupnosti' });
  }
});

// POST new apartment (admin only)
router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    // Validate required fields
    const requiredFields = ['title', 'seller_email', 'location', 'price', 'size', 'rooms', 'description', 'bedrooms', 'bathrooms', 'max_guests', 'available_units', 'property_type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ message: 'Missing required fields', fields: missingFields });
    }

    // Validate property_type
    const validPropertyTypes = ['apartman', 'vila', 'hotel'];
    if (!validPropertyTypes.includes(req.body.property_type)) {
      console.log('Invalid property type:', req.body.property_type);
      return res.status(400).json({ message: 'Invalid property type', validTypes: validPropertyTypes });
    }

    // Validate numeric fields
    const numericFields = ['price', 'size', 'rooms', 'bedrooms', 'bathrooms', 'max_guests', 'available_units'];
    for (const field of numericFields) {
      if (isNaN(req.body[field]) || parseFloat(req.body[field]) <= 0) {
        console.log(`Invalid ${field}:`, req.body[field]);
        return res.status(400).json({ message: `Invalid ${field} value` });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.seller_email)) {
      console.log('Invalid email format:', req.body.seller_email);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate available_units
    if (parseInt(req.body.available_units) <= 0) {
      console.log('Invalid available units:', req.body.available_units);
      return res.status(400).json({ message: 'Available units must be greater than 0' });
    }

    // Handle amenities
    let amenities = [];
    if (req.body.amenities) {
      try {
        amenities = JSON.parse(req.body.amenities);
        if (!Array.isArray(amenities)) {
          amenities = [amenities];
        }
      } catch (e) {
        amenities = req.body.amenities.split(',').map(item => item.trim()).filter(Boolean);
      }
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      const filename = path.basename(req.file.path);
      imageUrl = `${BASE_URL}/images/${filename}`;
      console.log('File saved as:', filename);
      console.log('Generated image URL:', imageUrl);
    } else if (req.body.image_url) {
      imageUrl = req.body.image_url;
    } else {
      console.log('No image provided');
      return res.status(400).json({ message: 'Either an image file or image URL is required' });
    }

    // Prepare data for insertion
    const apartmentData = {
      title: req.body.title,
      seller_email: req.body.seller_email,
      location: req.body.location,
      price: Number(parseFloat(req.body.price).toFixed(2)),
      size: parseInt(req.body.size),
      rooms: parseInt(req.body.rooms),
      description: req.body.description,
      bedrooms: parseInt(req.body.bedrooms),
      bathrooms: parseInt(req.body.bathrooms),
      max_guests: parseInt(req.body.max_guests),
      amenities: JSON.stringify(amenities),
      image_url: imageUrl,
      available_units: parseInt(req.body.available_units),
      property_type: req.body.property_type
    };

    console.log('Preparing to insert data:', apartmentData);

    const [result] = await db.execute(
      'INSERT INTO apartments (title, seller_email, location, price, size, rooms, description, bedrooms, bathrooms, max_guests, amenities, image_url, available_units, property_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [apartmentData.title, apartmentData.seller_email, apartmentData.location, apartmentData.price, apartmentData.size, apartmentData.rooms, apartmentData.description, apartmentData.bedrooms, apartmentData.bathrooms, apartmentData.max_guests, apartmentData.amenities, apartmentData.image_url, apartmentData.available_units, apartmentData.property_type]
    );

    console.log('Apartment created successfully with ID:', result.insertId);
    res.status(201).json({ id: result.insertId, ...apartmentData });
  } catch (error) {
    console.error('Error creating apartment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error creating apartment', error: error.message });
  }
});

// DELETE apartment (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get the apartment details first to check if there's a local image to delete
    const [apartment] = await db.execute('SELECT * FROM apartments WHERE id = ?', [req.params.id]);
    
    if (apartment.length === 0) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    // Delete the local image file if it exists and is a local file
    if (apartment[0].image_url.includes('/images/')) {
      const filename = path.basename(apartment[0].image_url);
      const imagePath = path.join(__dirname, '..', 'public', 'images', filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image file:', filename);
      }
    }

    // Delete the apartment from the database
    await db.execute('DELETE FROM apartments WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Apartment deleted successfully' });
  } catch (error) {
    console.error('Error deleting apartment:', error);
    res.status(500).json({ message: 'Error deleting apartment', error: error.message });
  }
});

// Error handling middleware for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ message: 'File upload error' });
  }
  if (err.message === 'Not an image! Please upload an image.') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = router; 