const db = require('./database');

const newProducts = [

  // ── BOYS FOOTWEAR ──────────────────────────────────────────────
  ['Nike Air Max Junior Sports Shoe', 'Nike', 'Boys Footwear', 2999, 4.8, 52,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5']),
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    20, 'Breathable Mesh'],

  ['Adidas Tensaur Hook Boys Casual', 'Adidas', 'Boys Footwear', 2199, 4.7, 41,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5']),
    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    15, 'CloudFoam Sole'],

  ['Bata Comfit Boy Runner Sneaker', 'Bata', 'Boys Footwear', 1299, 4.6, 34,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4']),
    'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=800&q=80',
    25, 'Anti-Slip Grip'],

  ['Puma Future Rider Jr Lifestyle', 'Puma', 'Boys Footwear', 2499, 4.8, 29,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5']),
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80',
    18, 'SoftFoam+ Cushion'],

  ['Skechers Boys Flex Advantage', 'Skechers', 'Boys Footwear', 2799, 4.7, 38,
    JSON.stringify(['Size 2', 'Size 3', 'Size 4', 'Size 5']),
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    12, 'Memory Foam Insole'],

  // ── GIRLS SANDALS ─────────────────────────────────────────────
  ['Bata Bubblegummers Girls Sandal', 'Bata', 'Girls Sandals', 799, 4.6, 48,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4']),
    'https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?auto=format&fit=crop&w=800&q=80',
    30, 'Soft EVA Footbed'],

  ['Paragon Solea Girls Comfort Sandal', 'Paragon', 'Girls Sandals', 599, 4.5, 36,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5']),
    'https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=800&q=80',
    40, 'Anti-Skid Base'],

  ['Action Flora Girls Party Sandal', 'Action', 'Girls Sandals', 999, 4.7, 22,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4']),
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    22, 'Glitter Strap Design'],

  ['Woodland Girls Outdoor Sandal', 'Woodland', 'Girls Sandals', 1499, 4.8, 17,
    JSON.stringify(['Size 2', 'Size 3', 'Size 4', 'Size 5']),
    'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=800&q=80',
    14, 'Leather Upper'],

  // ── SCHOOL SHOES ──────────────────────────────────────────────
  ['Bata Prefect Boys School Shoe', 'Bata', 'School Shoes', 1099, 4.7, 84,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6']),
    'https://images.unsplash.com/photo-1518894781321-630e638d0742?auto=format&fit=crop&w=800&q=80',
    35, 'Durable PU Sole'],

  ['Paragon Classic School Derby', 'Paragon', 'School Shoes', 799, 4.5, 62,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5']),
    'https://images.unsplash.com/photo-1531325082793-ca7c9db6a4c1?auto=format&fit=crop&w=800&q=80',
    50, 'Lightweight Sole'],

  ['Liberty Gliders School Shoe', 'Liberty', 'School Shoes', 949, 4.6, 51,
    JSON.stringify(['Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6']),
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    28, 'Slip-Resistant Sole'],

  ['Campus School Pro White Shoe', 'Campus', 'School Shoes', 1199, 4.8, 39,
    JSON.stringify(['Size 1', 'Size 2', 'Size 3', 'Size 4', 'Size 5', 'Size 6']),
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
    20, 'Air-Cushion Midsole'],

  // ── LAPTOP BACKPACKS ──────────────────────────────────────────
  ['Wildcraft Alpha 45L Laptop Backpack', 'Wildcraft', 'Laptop Backpacks', 2499, 4.9, 67,
    JSON.stringify(['Standard']),
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    18, 'Water-Resistant 900D'],

  ['Skybags Helix 35L Laptop Bag', 'Skybags', 'Laptop Backpacks', 1799, 4.7, 54,
    JSON.stringify(['Standard']),
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    24, 'Padded Laptop Sleeve'],

  ['American Tourister Zork Backpack', 'American Tourister', 'Laptop Backpacks', 2199, 4.8, 43,
    JSON.stringify(['Standard']),
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80',
    16, 'Ergonomic Shoulder Strap'],

  ['HP Active 15.6" Laptop Backpack', 'HP', 'Laptop Backpacks', 1499, 4.6, 38,
    JSON.stringify(['Standard']),
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    22, 'Organized Compartments'],

  ['Puma Academy Backpack 24L', 'Puma', 'Laptop Backpacks', 1999, 4.7, 29,
    JSON.stringify(['Standard']),
    'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=800&q=80',
    20, 'Ventilated Back Panel'],

  // ── SPORT & DUFFLE BAGS ───────────────────────────────────────
  ['Adidas Tiro Duffle Bag Large', 'Adidas', 'Sport & Duffle Bags', 2299, 4.8, 47,
    JSON.stringify(['50L']),
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80',
    14, 'Climaproof Fabric'],

  ['Nike Brasilia 9.5 Training Duffel', 'Nike', 'Sport & Duffle Bags', 2999, 4.9, 58,
    JSON.stringify(['45L']),
    'https://images.unsplash.com/photo-1585914641050-fa9883c4e21c?auto=format&fit=crop&w=800&q=80',
    10, 'Polyester Canvas'],

  ['Puma Challenger Duffel S', 'Puma', 'Sport & Duffle Bags', 1799, 4.6, 33,
    JSON.stringify(['35L']),
    'https://images.unsplash.com/photo-1566043291555-95e8d62c4af3?auto=format&fit=crop&w=800&q=80',
    16, 'Heavy-Duty Ripstop'],

  ['Wildcraft Voyager Gym Duffel', 'Wildcraft', 'Sport & Duffle Bags', 1599, 4.7, 27,
    JSON.stringify(['40L']),
    'https://images.unsplash.com/photo-1519735777090-ec97162dc266?auto=format&fit=crop&w=800&q=80',
    18, 'Water-Resistant Nylon'],

  // ── TREKKING BACKPACKS ────────────────────────────────────────
  ['Wildcraft Denali 55L Trek Pack', 'Wildcraft', 'Trekking Backpacks', 4999, 4.9, 34,
    JSON.stringify(['55L']),
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    8, 'Air-Channel Back System'],

  ['Quechua NH500 40L Hiking Pack', 'Quechua', 'Trekking Backpacks', 3499, 4.8, 29,
    JSON.stringify(['40L']),
    'https://images.unsplash.com/photo-1606859503450-9e1c7dd6e007?auto=format&fit=crop&w=800&q=80',
    10, 'Anti-Fatigue Hip Belt'],

  ['Woodland Traveller 65L Rucksack', 'Woodland', 'Trekking Backpacks', 5499, 4.9, 21,
    JSON.stringify(['65L']),
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    6, 'Aluminium Frame Support'],

  ['F Gear Instafit 44L Trekking Bag', 'F Gear', 'Trekking Backpacks', 2799, 4.7, 18,
    JSON.stringify(['44L']),
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    12, 'Rain Cover Included'],

  // ── RIDER BIKE BAGS ───────────────────────────────────────────
  ['Royal Enfield Magnetic Tank Bag', 'Royal Enfield', 'Rider Bike Bags', 3499, 4.8, 23,
    JSON.stringify(['18L']),
    'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=800&q=80',
    10, 'Magnetic Tank Lock'],

  ['Rynox Optimus Pro 3 Tank Bag', 'Rynox', 'Rider Bike Bags', 5999, 4.9, 18,
    JSON.stringify(['22L']),
    'https://images.unsplash.com/photo-1558981285-6f0c7bbe8e04?auto=format&fit=crop&w=800&q=80',
    8, 'Quick-Release System'],

  ['Viaterra Claw Motorcycle Saddlebag', 'Viaterra', 'Rider Bike Bags', 4499, 4.7, 14,
    JSON.stringify(['30L']),
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    7, 'Waterproof Roll-Top'],

  ['Solace Torpedo Tail Bag', 'Solace', 'Rider Bike Bags', 2799, 4.6, 11,
    JSON.stringify(['15L']),
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80',
    12, 'Reflective Strip Safety']
];

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO Products (name, brand, category, price_inr, rating, review_count, sizes_json, image_url, stock_quantity, material_badge)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  newProducts.forEach(item => {
    stmt.run(item, (err) => {
      if (err) console.error('Error seeding:', item[0], err.message);
      else console.log('✅ Seeded:', item[0]);
    });
  });

  stmt.finalize(() => {
    console.log('\n🎉 All new products seeded successfully!');
    console.log(`📦 Total new products added: ${newProducts.length}`);
    db.close();
  });
});
