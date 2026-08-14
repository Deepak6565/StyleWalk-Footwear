const db = require('./database');

db.serialize(() => {
  const defaultSizes = JSON.stringify(["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"]);

  const womenItems = [
    [
      "Walkaroo Pink Bloom Comfort Flip-Flops",
      "Walkaroo",
      "Slippers & Sandals",
      799,
      4.9,
      54,
      defaultSizes,
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
      25,
      "Ultra-Soft Cushion"
    ],
    [
      "Metro Floral Dual-Buckle Orthotic Cork Slides",
      "Metro",
      "Slippers & Sandals",
      1490,
      4.8,
      42,
      defaultSizes,
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
      18,
      "Contoured Arch Support"
    ],
    [
      "Classico Cushion Dual-Strap Comfort Wedge Sandals",
      "Bata",
      "Slippers & Sandals",
      1899,
      4.9,
      67,
      defaultSizes,
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      20,
      "Dual Buckle Cushion"
    ],
    [
      "Mochi Rose Tan T-Strap Soft Slider",
      "Mochi",
      "Slippers & Sandals",
      1290,
      4.7,
      35,
      defaultSizes,
      "https://images.unsplash.com/photo-1621996346565-e3d5d6281318?auto=format&fit=crop&w=800&q=80",
      15,
      "Soft Memory Footbed"
    ],
    [
      "Tiesta Crystal Embellished Platform Wedge Heels",
      "Tiesta",
      "Heels & Wedges",
      3999,
      4.9,
      88,
      defaultSizes,
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      10,
      "Handcrafted Crystal"
    ],
    [
      "Eridani Aliha Stiletto Mule Heels",
      "Eridani",
      "Heels & Wedges",
      2790,
      4.8,
      46,
      defaultSizes,
      "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80",
      12,
      "Pointed Bow Mesh"
    ],
    [
      "Metro High-Block Ankle Strap Heels",
      "Metro",
      "Heels & Wedges",
      3490,
      4.9,
      59,
      defaultSizes,
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80",
      14,
      "Patent Gloss Leather"
    ],
    [
      "Louis Philippe Stiletto Gloss Black Pumps",
      "Louis Philippe",
      "Heels & Wedges",
      4299,
      4.9,
      73,
      defaultSizes,
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80",
      8,
      "Sleek Gloss Finish"
    ]
  ];

  const stmt = db.prepare(`
    INSERT INTO Products (name, brand, category, price_inr, rating, review_count, sizes_json, image_url, stock_quantity, material_badge)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  womenItems.forEach(item => {
    stmt.run(item);
    console.log('Seeded Women Footwear Item:', item[0]);
  });

  stmt.finalize(() => {
    console.log('Successfully seeded Women slippers, sandals, and heels into stylewalk.db!');
  });
});
