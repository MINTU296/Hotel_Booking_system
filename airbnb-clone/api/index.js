require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const imageDownloader = require('image-downloader');
const multer = require('multer');

// Mongoose models
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');

// Configuration constants
const bcryptSalt = bcrypt.genSaltSync(10);
// Replace with your actual secret in production
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg'; 
const MONGO_URL = process.env.MONGO_URL;
const FRONTEND_URL = 'http://localhost:5173';

// Initialize Express
const app = express();


// Connect to MongoDB
mongoose.connect(MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: FRONTEND_URL,
}));

// Serve the /uploads folder statically
app.use('/uploads', express.static(__dirname + '/uploads'));

/**
 * Moves file from /tmp to /uploads and returns the *relative* path, e.g.:
 *   "/uploads/1678889999999_photo.jpg"
 *
 * IMPORTANT: On the front end, you should prefix "http://localhost:5000"
 * when displaying these images, e.g.:
 *   <img src={`http://localhost:5000${photoPath}`} ... />
 */
function saveToLocal(tmpPath, originalFilename) {
  const newFilename = Date.now() + '_' + originalFilename;
  const newDestination = __dirname + '/uploads/' + newFilename;
  fs.renameSync(tmpPath, newDestination);
  return `/uploads/${newFilename}`;
}

// Reads token from cookies, verifies it, and returns the decoded user data
function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    const { token } = req.cookies;
    if (!token) {
      return reject(new Error('No token provided'));
    }
    jwt.verify(token, jwtSecret, {}, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
}

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------

// Simple test route
app.get('/api/test', (req, res) => {
  res.json('Test OK');
});

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e.message);
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      return res.status(404).json('User not found');
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(401).json('Invalid credentials');
    }
    // Generate JWT
    jwt.sign(
      { email: userDoc.email, id: userDoc._id },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        // Send token as cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        }).json(userDoc);
      }
    );
  } catch (err) {
    res.status(500).json('Login failed');
  }
});

// Get user profile (requires token cookie)
app.get('/api/profile', async (req, res) => {
  try {
    if (!req.cookies.token) return res.json(null);
    const userData = await getUserDataFromReq(req);
    const user = await User.findById(userData.id);
    if (!user) return res.status(404).json('User not found');
    res.json({ name: user.name, email: user.email, _id: user._id });
  } catch (err) {
    res.status(401).json('Invalid token');
  }
});

// User Logout
app.post('/api/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0) }).json(true);
});

// Upload an image by URL
app.post('/api/upload-by-link', async (req, res) => {
  try {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    const { filename } = await imageDownloader.image({
      url: link,
      dest: '/tmp/' + newName,
    });
    const url = saveToLocal(filename, newName);
    // e.g. "/uploads/1678889999999_photo.jpg"
    res.json(url);
  } catch (err) {
    res.status(500).json('Upload failed');
  }
});

// Upload images from the user's machine
const photosMiddleware = multer({ dest: '/tmp' });
app.post('/api/upload', photosMiddleware.array('photos', 100), async (req, res) => {
  try {
    const urls = req.files.map(file => {
      return saveToLocal(file.path, file.originalname);
    });
    // e.g. ["/uploads/1678889999999_photo1.jpg", "/uploads/1678889999999_photo2.jpg", ...]
    res.json(urls);
  } catch (err) {
    res.status(500).json('Upload failed');
  }
});

// Get places for the current user
app.get('/api/user-places', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const userPlaces = await Place.find({ owner: userData.id });
    res.json(userPlaces);
  } catch (err) {
    res.status(500).json('Failed to get user places');
  }
});

// Get all places
app.get('/api/places', async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json('Failed to get places');
  }
});

// Get a specific place by ID
app.get('/api/places/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const place = await Place.findById(id);
    res.json(place);
  } catch (err) {
    res.status(500).json('Failed to get place');
  }
});

// Create a new place
app.post('/api/places', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const {
      title, address, addedPhotos, description,
      perks, extraInfo, checkIn, checkOut, maxGuests, price,
    } = req.body;
    const placeDoc = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addedPhotos, // array of "/uploads/xxx.jpg" from the front end
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });
    res.json(placeDoc);
  } catch (err) {
    res.status(401).json('Unauthorized');
  }
});

// Update a place
app.put('/api/places', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const {
      id, title, address, addedPhotos, description,
      perks, extraInfo, checkIn, checkOut, maxGuests, price,
    } = req.body;
    const placeDoc = await Place.findById(id);
    if (!placeDoc) {
      return res.status(404).json('Place not found');
    }
    if (placeDoc.owner.toString() !== userData.id) {
      return res.status(403).json('You are not the owner of this place');
    }
    placeDoc.set({
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });
    await placeDoc.save();
    res.json('ok');
  } catch (err) {
    res.status(500).json('Failed to update place');
  }
});

// Create a booking
app.post('/api/bookings', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const {
      place, checkIn, checkOut, numberOfGuests, name, phone, price,
    } = req.body;
    const bookingDoc = await Booking.create({
      place,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
      user: userData.id,
    });
    res.json(bookingDoc);
  } catch (err) {
    res.status(500).json('Failed to create booking');
  }
});

// Get bookings for the current user
app.get('/api/bookings', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const userBookings = await Booking.find({ user: userData.id }).populate('place');
    res.json(userBookings);
  } catch (err) {
    res.status(500).json('Failed to get bookings');
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});
