const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  db.get('SELECT * FROM Users WHERE email = ?', [email.toLowerCase()], async (err, existingUser) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    try {
      const password_hash = await bcrypt.hash(password, 10);
      const role = 'customer';

      db.run(
        'INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email.toLowerCase(), password_hash, role],
        function (err) {
          if (err) return res.status(500).json({ error: 'Error creating user' });

          const user = { id: this.lastID, name, email: email.toLowerCase(), role };
          const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

          res.status(201).json({ token, user });
        }
      );
    } catch (e) {
      res.status(500).json({ error: 'Server error during hashing' });
    }
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  db.get('SELECT * FROM Users WHERE email = ?', [email.toLowerCase()], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: userPayload });
  });
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  db.get('SELECT id, name, email, role FROM Users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });
});

module.exports = router;
