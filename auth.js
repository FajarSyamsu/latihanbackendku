const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Gunakan 'Authorization' agar konsisten dengan server
    const token = req.header('Authorization');

    if (!token) return res.status(401).json({ msg: 'Akses ditolak. Silahkan login dulu.' });

    try {
        // Kunci harus SAMA dengan yang ada di server.js
        const decoded = jwt.verify(token, 'UNIDAMALL_SECRET_KEY_2024'); 
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ msg: 'Token tidak valid.' });
    }
};