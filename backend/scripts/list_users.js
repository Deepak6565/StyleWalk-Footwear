const db = require('../database');

db.all("SELECT id, name, email, role FROM Users", (err, rows) => {
  if (err) { console.error('Error reading users:', err.message); process.exit(1); }
  console.log('Users:');
  rows.forEach(r => console.log(`${r.id}: ${r.name} <${r.email}> (${r.role})`));
  process.exit(0);
});
