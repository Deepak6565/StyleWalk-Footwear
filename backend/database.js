const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const fs = require('fs');

const possibleOrigPaths = [
  path.resolve(__dirname, 'stylewalk.db'),
  path.resolve(process.cwd(), 'backend', 'stylewalk.db'),
  path.resolve(process.cwd(), 'stylewalk.db')
];

let origDbPath = possibleOrigPaths.find(p => fs.existsSync(p)) || possibleOrigPaths[0];
let dbPath = origDbPath;

if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const tmpDbPath = '/tmp/stylewalk.db';
  try {
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(origDbPath)) {
        fs.copyFileSync(origDbPath, tmpDbPath);
        console.log(`[DB] Copied database from ${origDbPath} to ${tmpDbPath}`);
      } else {
        console.log(`[DB] Original db not found at ${origDbPath}, creating new at ${tmpDbPath}`);
      }
    }
    dbPath = tmpDbPath;
  } catch (copyErr) {
    console.error('[DB] Error configuring /tmp/stylewalk.db:', copyErr);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DB] Failed to open SQLite database:', err);
  } else {
    console.log('[DB] SQLite DB connected successfully at path:', dbPath);
  }
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  // 1. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('customer', 'admin')) DEFAULT 'customer'
    )
  `);

  // 2. Products Table (Indian Brands & Bags Edition)
  db.run(`
    CREATE TABLE IF NOT EXISTS Products (
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

  // 3. Reviews Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating REAL CHECK(rating >= 1 AND rating <= 5) NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    )
  `);

  // 4. Orders Table (Clean Schema without restrictive legacy CHECK constraints)
  db.run(`
    CREATE TABLE IF NOT EXISTS Orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0.0,
      discount_amount REAL NOT NULL DEFAULT 0.0,
      total_amount REAL NOT NULL,
      coupon_used TEXT DEFAULT NULL,
      stripe_payment_intent_id TEXT,
      payment_method TEXT DEFAULT 'COD',
      payment_status TEXT DEFAULT 'Confirmed',
      payment_screenshot TEXT DEFAULT NULL,
      rejection_reason TEXT DEFAULT NULL,
      order_status TEXT DEFAULT 'Confirmed',
      status_history TEXT DEFAULT NULL,
      shipping_address TEXT NOT NULL,
      tracking_number TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    )
  `);



  // 5. AdminSettings Table for Store QR Code & Configs
  db.run(`
    CREATE TABLE IF NOT EXISTS AdminSettings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Column migrations for existing Orders tables
  db.run("ALTER TABLE Orders ADD COLUMN payment_method TEXT DEFAULT 'COD'", () => {});
  db.run("ALTER TABLE Orders ADD COLUMN payment_screenshot TEXT DEFAULT NULL", () => {});
  db.run("ALTER TABLE Orders ADD COLUMN rejection_reason TEXT DEFAULT NULL", () => {});
  db.run("ALTER TABLE Orders ADD COLUMN status_history TEXT DEFAULT NULL", () => {});
  db.run("ALTER TABLE Orders ADD COLUMN tracking_number TEXT DEFAULT NULL", () => {});

  // Seed default Admin UPI QR Code
  db.get("SELECT value FROM AdminSettings WHERE key = 'admin_qr_code'", (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO AdminSettings (key, value) VALUES ('admin_qr_code', ?)",
        ["https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=stylewalk@upi%26pn=StyleWalk%20Store%26cu=INR"]
      );
    }
  });

  // 5. Coupons Table
  db.run(`
    CREATE TABLE IF NOT EXISTS Coupons (
      code TEXT PRIMARY KEY,
      discount_type TEXT CHECK(discount_type IN ('percent', 'flat')) NOT NULL,
      discount_value REAL NOT NULL,
      active INTEGER DEFAULT 1
    )
  `);

  // Seed Users
  db.get("SELECT COUNT(*) AS count FROM Users WHERE email = 'customer@stylewalk.com'", (err, row) => {
    if (!row || row.count === 0) {
      console.log("Seeding customer user account...");
      const userPass = bcrypt.hashSync('user123', 10);
      db.run(
        "INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        ["Alex Johnson", "customer@stylewalk.com", userPass, "customer"]
      );
    }
  });

  db.get("SELECT COUNT(*) AS count FROM Users WHERE email = 'admin@stylewalk.com'", (err, row) => {
    if (!row || row.count === 0) {
      console.log("Seeding admin user account...");
      const adminPass = bcrypt.hashSync('admin123', 10);
      db.run(
        "INSERT INTO Users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        ["StyleWalk Admin", "admin@stylewalk.com", adminPass, "admin"]
      );
    }
  });

  // Seed Coupons (DESI10: 10% off, FESTIVE20: ₹500 off)
  db.get("SELECT COUNT(*) AS count FROM Coupons", (err, row) => {
    if (!row || row.count === 0) {
      console.log("Seeding Coupons (DESI10 & FESTIVE20)...");
      const stmt = db.prepare("INSERT INTO Coupons (code, discount_type, discount_value, active) VALUES (?, ?, ?, ?)");
      stmt.run("DESI10", "percent", 10, 1);
      stmt.run("FESTIVE20", "flat", 500, 1);
      stmt.finalize();
      console.log("Coupons seeded.");
    }
  });

  // Seed 12 Indian Brand Footwear Products
  db.get("SELECT COUNT(*) AS count FROM Products", (err, row) => {
    if (!row || row.count === 0) {
      console.log("Seeding 12 Indian Footwear Brand Products...");
      const defaultSizes = JSON.stringify(["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]);

      const indianProducts = [
        {
          name: "Campus Oxyfit Street Sneakers",
          brand: "Campus",
          category: "Sneakers",
          price_inr: 2499,
          rating: 4.8,
          review_count: 34,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 15,
          material_badge: "Breathable Mesh"
        },
        {
          name: "Puma x Royal Enfield High-Top Sneakers",
          brand: "Puma India",
          category: "Sneakers",
          price_inr: 5999,
          rating: 4.9,
          review_count: 52,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 8,
          material_badge: "Genuine Leather"
        },
        {
          name: "Bata Oxford Executive Derby",
          brand: "Bata",
          category: "Formal Shoes",
          price_inr: 3299,
          rating: 4.7,
          review_count: 28,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 12,
          material_badge: "Premium Leather"
        },
        {
          name: "Louis Philippe Modern Monk Strap",
          brand: "Louis Philippe",
          category: "Formal Shoes",
          price_inr: 4999,
          rating: 4.9,
          review_count: 19,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 6,
          material_badge: "Burnished Leather"
        },
        {
          name: "Crocs Classic Unisex Clogs - Charcoal",
          brand: "Crocs",
          category: "Crocs & Clogs",
          price_inr: 3995,
          rating: 4.8,
          review_count: 88,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 20,
          material_badge: "Croslite Foam"
        },
        {
          name: "Metro Unisex All-Weather Clogs",
          brand: "Metro",
          category: "Crocs & Clogs",
          price_inr: 1890,
          rating: 4.6,
          review_count: 41,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 14,
          material_badge: "Molded EVA"
        },
        {
          name: "Woodland Rough-Terrain Leather Sandals",
          brand: "Woodland",
          category: "Slippers & Sandals",
          price_inr: 3495,
          rating: 4.9,
          review_count: 63,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 10,
          material_badge: "Heavy-Duty Leather"
        },
        {
          name: "Paragon Solextra Comfort Sliders",
          brand: "Paragon",
          category: "Slippers & Sandals",
          price_inr: 799,
          rating: 4.5,
          review_count: 95,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 25,
          material_badge: "Soft Memory Foam"
        },
        {
          name: "Red Chief Genuine Leather Outdoor Boots",
          brand: "Red Chief",
          category: "Boots",
          price_inr: 4295,
          rating: 4.8,
          review_count: 47,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 7,
          material_badge: "Nubuck Leather"
        },
        {
          name: "Liberty Warrior Trekking Boots",
          brand: "Liberty",
          category: "Boots",
          price_inr: 2899,
          rating: 4.7,
          review_count: 31,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 11,
          material_badge: "Traction Leather"
        },
        {
          name: "Mochi Royal Velvet Kolhapuri / Mojari",
          brand: "Mochi",
          category: "Ethnic Footwear",
          price_inr: 2190,
          rating: 4.9,
          review_count: 22,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 9,
          material_badge: "Handcrafted Velvet"
        },
        {
          name: "Metro Embellished Ethnic Mojaris",
          brand: "Metro",
          category: "Ethnic Footwear",
          price_inr: 2490,
          rating: 4.8,
          review_count: 17,
          sizes_json: defaultSizes,
          image_url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 5,
          material_badge: "Embroidered Silk"
        },
        {
          name: "Wildcraft Stealth Pro Laptop Backpack",
          brand: "Wildcraft",
          category: "Bags",
          price_inr: 2299,
          rating: 4.9,
          review_count: 45,
          sizes_json: JSON.stringify(["Standard 30L"]),
          image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 18,
          material_badge: "Water-Resistant Cordura"
        },
        {
          name: "Puma SportX Convertible Duffle Bag",
          brand: "Puma India",
          category: "Bags",
          price_inr: 2899,
          rating: 4.8,
          review_count: 38,
          sizes_json: JSON.stringify(["Medium 45L"]),
          image_url: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 12,
          material_badge: "Heavy-Duty Ripstop"
        },
        {
          name: "Woodland Expedition 60L Trekking Backpack",
          brand: "Woodland",
          category: "Bags",
          price_inr: 4599,
          rating: 4.9,
          review_count: 29,
          sizes_json: JSON.stringify(["Large 60L"]),
          image_url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 8,
          material_badge: "Ergonomic Frame"
        },
        {
          name: "Royal Enfield Urban Rider Magnetic Bike Bag",
          brand: "Royal Enfield",
          category: "Bags",
          price_inr: 3199,
          rating: 4.7,
          review_count: 21,
          sizes_json: JSON.stringify(["Compact 18L"]),
          image_url: "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=800&q=80",
          stock_quantity: 10,
          material_badge: "Magnetic Tank Lock"
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO Products (name, brand, category, price_inr, rating, review_count, sizes_json, image_url, stock_quantity, material_badge)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      indianProducts.forEach(prod => {
        stmt.run(prod.name, prod.brand, prod.category, prod.price_inr, prod.rating, prod.review_count, prod.sizes_json, prod.image_url, prod.stock_quantity, prod.material_badge);
      });
      stmt.finalize((errFinal) => {
        if (!errFinal) {
          console.log("12 Indian Brand footwear products seeded.");
          // Seed sample reviews
          db.run(`
            INSERT INTO Reviews (product_id, user_id, user_name, rating, comment) VALUES
            (1, 2, 'Alex Johnson', 5, 'Campus sneakers are amazingly light and comfortable for daily wear!'),
            (2, 2, 'Alex Johnson', 5, 'Puma Royal Enfield edition leather quality is top notch!'),
            (5, 2, 'Alex Johnson', 5, 'Crocs clogs cushioning is unparalleled. Best casual footwear.'),
            (11, 2, 'Alex Johnson', 5, 'Mochi handcrafted Kolhapuris look stunning with ethnic outfits.')
          `, (errRev) => {
            if (!errRev) console.log("Sample reviews seeded.");
          });
        }
      });
    }
  });
});

module.exports = db;
