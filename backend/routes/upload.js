const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/upload/screenshot - Customer uploads payment screenshot
router.post('/screenshot', verifyToken, (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data (imageBase64) is required.' });
    }

    let base64Data = imageBase64;
    let ext = 'png';

    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      ext = parts[0].split('/')[1] || 'png';
      base64Data = parts[1];
    }

    const filename = `screenshot_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, base64Data, 'base64');

    const imageUrl = `/uploads/${filename}`;
    res.json({ imageUrl, message: 'Screenshot uploaded successfully!' });
  } catch (err) {
    console.error('Screenshot upload error:', err);
    res.status(500).json({ error: 'Failed to save screenshot image: ' + err.message });
  }
});

// POST /api/upload/qr - Admin uploads custom QR code image
router.post('/qr', verifyToken, requireAdmin, (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    let base64Data = imageBase64;
    let ext = 'png';

    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      ext = parts[0].split('/')[1] || 'png';
      base64Data = parts[1];
    }

    const filename = `qr_code_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, base64Data, 'base64');

    const qrUrl = `/uploads/${filename}`;

    db.run(
      "INSERT INTO AdminSettings (key, value) VALUES ('admin_qr_code', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [qrUrl],
      (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update QR code setting.' });
        res.json({ qrUrl, message: 'Store QR code updated successfully!' });
      }
    );
  } catch (err) {
    console.error('QR upload error:', err);
    res.status(500).json({ error: 'Failed to save QR code: ' + err.message });
  }
});

module.exports = router;
