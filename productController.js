const bcrypt = require('bcryptjs'); // Buat enkripsi password (Point 4)

exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    
    // Hash password (Point 4 - Keamanan)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Simpan ke Database...
    console.log(`User ${email} terdaftar dengan password aman: ${hashedPassword}`);
};