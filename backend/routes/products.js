const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/products (Filter by category, brand, search, min/max price, sort)
router.get('/', (req, res) => {
  const { category, brand, search, minPrice, maxPrice, sort } = req.query;

  let sql = 'SELECT * FROM Products WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    sql += ' AND (category = ? OR LOWER(category) LIKE ? OR LOWER(name) LIKE ?)';
    const catTerm = `%${category.trim().toLowerCase()}%`;
    params.push(category, catTerm, catTerm);
  }

  if (brand && brand !== 'All') {
    sql += ' AND brand = ?';
    params.push(brand);
  }

  if (minPrice) {
    sql += ' AND price_inr >= ?';
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    sql += ' AND price_inr <= ?';
    params.push(Number(maxPrice));
  }

  if (search && search.trim() !== '') {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(category) LIKE ? OR LOWER(material_badge) LIKE ?)';
    const term = `%${search.trim().toLowerCase()}%`;
    params.push(term, term, term, term);
  }

  if (sort === 'price_asc') {
    sql += ' ORDER BY price_inr ASC';
  } else if (sort === 'price_desc') {
    sql += ' ORDER BY price_inr DESC';
  } else if (sort === 'rating') {
    sql += ' ORDER BY rating DESC';
  } else {
    sql += ' ORDER BY id DESC';
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database query error' });
    const formatted = rows.map(r => ({
      ...r,
      price: r.price_inr, // backward compatibility mapping
      sizes: JSON.parse(r.sizes_json || '[]')
    }));
    res.json(formatted);
  });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM Products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) return res.status(500).json({ error: 'Database query error' });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json({
      ...product,
      price: product.price_inr,
      sizes: JSON.parse(product.sizes_json || '[]')
    });
  });
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', (req, res) => {
  const sql = 'SELECT * FROM Reviews WHERE product_id = ? ORDER BY created_at DESC';
  db.all(sql, [req.params.id], (err, reviews) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch reviews' });
    res.json(reviews);
  });
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', verifyToken, (req, res) => {
  const productId = req.params.id;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  const userId = req.user.id;
  const userName = req.user.name || 'Anonymous User';

  const sql = `
    INSERT INTO Reviews (product_id, user_id, user_name, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [productId, userId, userName, Number(rating), comment], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to save review' });

    // Recalculate product rating & review_count
    db.get('SELECT AVG(rating) as avg_rating, COUNT(*) as r_count FROM Reviews WHERE product_id = ?', [productId], (err2, result) => {
      if (!err2 && result && result.avg_rating) {
        const newRating = Math.round(result.avg_rating * 10) / 10;
        db.run('UPDATE Products SET rating = ?, review_count = ? WHERE id = ?', [newRating, result.r_count, productId]);
      }
    });

    res.status(201).json({
      id: this.lastID,
      product_id: Number(productId),
      user_id: userId,
      user_name: userName,
      rating: Number(rating),
      comment,
      created_at: new Date().toISOString()
    });
  });
});

// POST /api/products (Admin Only)
router.post('/', verifyToken, requireAdmin, (req, res) => {
  const { name, brand, category, price_inr, price, rating, sizes, image_url, stock_quantity, material_badge } = req.body;

  const cost = price_inr !== undefined ? Number(price_inr) : Number(price);

  if (!name || !brand || !category || cost === undefined || stock_quantity === undefined) {
    return res.status(400).json({ error: 'Missing required product fields' });
  }

  const sizes_json = JSON.stringify(sizes || ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]);
  const imgUrl = image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
  const prodRating = rating || 4.8;
  const matBadge = material_badge || 'Premium Craft';

  const sql = `
    INSERT INTO Products (name, brand, category, price_inr, rating, review_count, sizes_json, image_url, stock_quantity, material_badge)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
  `;

  db.run(sql, [name, brand, category, cost, Number(prodRating), sizes_json, imgUrl, Number(stock_quantity), matBadge], function (err) {
    if (err) return res.status(500).json({ error: 'Error inserting product: ' + err.message });

    db.get('SELECT * FROM Products WHERE id = ?', [this.lastID], (err2, newProduct) => {
      if (err2) return res.status(201).json({ id: this.lastID, name, brand, category, price_inr: cost, stock_quantity });
      res.status(201).json({
        ...newProduct,
        price: newProduct.price_inr,
        sizes: JSON.parse(newProduct.sizes_json)
      });
    });
  });
});

// PUT /api/products/:id (Admin Only)
router.put('/:id', verifyToken, requireAdmin, (req, res) => {
  const { name, brand, category, price_inr, price, rating, sizes, image_url, stock_quantity, material_badge } = req.body;
  const productId = req.params.id;

  db.get('SELECT * FROM Products WHERE id = ?', [productId], (err, existing) => {
    if (err || !existing) return res.status(404).json({ error: 'Product not found' });

    const updatedName = name !== undefined ? name : existing.name;
    const updatedBrand = brand !== undefined ? brand : existing.brand;
    const updatedCategory = category !== undefined ? category : existing.category;
    const updatedPrice = price_inr !== undefined ? Number(price_inr) : (price !== undefined ? Number(price) : existing.price_inr);
    const updatedRating = rating !== undefined ? Number(rating) : existing.rating;
    const updatedSizesJson = sizes !== undefined ? JSON.stringify(sizes) : existing.sizes_json;
    const updatedImageUrl = image_url !== undefined ? image_url : existing.image_url;
    const updatedStock = stock_quantity !== undefined ? Math.max(0, Number(stock_quantity)) : existing.stock_quantity;
    const updatedBadge = material_badge !== undefined ? material_badge : existing.material_badge;

    const sql = `
      UPDATE Products
      SET name = ?, brand = ?, category = ?, price_inr = ?, rating = ?, sizes_json = ?, image_url = ?, stock_quantity = ?, material_badge = ?
      WHERE id = ?
    `;

    db.run(
      sql,
      [updatedName, updatedBrand, updatedCategory, updatedPrice, updatedRating, updatedSizesJson, updatedImageUrl, updatedStock, updatedBadge, productId],
      function (err2) {
        if (err2) return res.status(500).json({ error: 'Error updating product: ' + err2.message });

        db.get('SELECT * FROM Products WHERE id = ?', [productId], (err3, updated) => {
          res.json({
            ...updated,
            price: updated.price_inr,
            sizes: JSON.parse(updated.sizes_json)
          });
        });
      }
    );
  });
});

// DELETE /api/products/:id (Admin Only)
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM Products WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Error deleting product' });
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  });
});

module.exports = router;
