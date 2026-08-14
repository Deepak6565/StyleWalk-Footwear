const db = require('../database');

db.all("PRAGMA table_info('Orders')", (err, rows) => {
  if (err) {
    console.error('Error querying schema:', err.message);
    process.exit(1);
  }
  console.log('Orders schema columns:');
  rows.forEach(r => console.log(`${r.cid}: ${r.name} (${r.type})`));
  process.exit(0);
});
