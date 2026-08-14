const db = require('./database');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Products_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      price_inr REAL NOT NULL,
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 12,
      sizes_json TEXT NOT NULL,
      image_url TEXT NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 10,
      material_badge TEXT DEFAULT 'Premium Craft'
    )
  `);

  db.run(`INSERT OR IGNORE INTO Products_new SELECT * FROM Products`);
  db.run(`DROP TABLE IF EXISTS Products`);
  db.run(`ALTER TABLE Products_new RENAME TO Products`);

  const bagItems = [
    ['Wildcraft Stealth Pro Laptop Backpack', 'Wildcraft', 'Bags', 2299, 4.9, 45, JSON.stringify(['Standard 30L']), 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 18, 'Water-Resistant Cordura'],
    ['Puma SportX Convertible Duffle Bag', 'Puma India', 'Bags', 2899, 4.8, 38, JSON.stringify(['Medium 45L']), 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80', 12, 'Heavy-Duty Ripstop'],
    ['Woodland Expedition 60L Trekking Backpack', 'Woodland', 'Bags', 4599, 4.9, 29, JSON.stringify(['Large 60L']), 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80', 8, 'Ergonomic Frame'],
    ['Royal Enfield Urban Rider Magnetic Bike Bag', 'Royal Enfield', 'Bags', 3199, 4.7, 21, JSON.stringify(['Compact 18L']), 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=800&q=80', 10, 'Magnetic Tank Lock']
  ];

  const stmt = db.prepare(`
    INSERT INTO Products (name, brand, category, price_inr, rating, review_count, sizes_json, image_url, stock_quantity, material_badge)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  bagItems.forEach(item => {
    stmt.run(item);
    console.log('Seeded bag item:', item[0]);
  });

  stmt.finalize(() => {
    console.log('Bag products successfully migrated & seeded!');
  });
});
