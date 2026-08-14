const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const payload = { id: 1, name: 'Alex Johnson', email: 'customer@stylewalk.com', role: 'customer' };
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
console.log(token);
