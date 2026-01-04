// 1. IMPORT LIBRARY (WAJIB PALING ATAS)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// 2. IMPORT FILE LOCAL (Auth & Controller)
const authMiddlewareLocal = require('./auth'); 
const productController = require('./productController');

// 3. INISIALISASI APLIKASI
const app = express();
const JWT_SECRET = "UNIDAMALL_SECRET_KEY_2024";

// 4. KONFIGURASI KEAMANAN & MIDDLEWARE
app.use(helmet({
  crossOriginResourcePolicy: false,
})); 
app.use(cors()); 
app.use(express.json()); 

// Batasi jumlah request (Rate Limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100 
});
app.use('/api/', limiter);

// 5. DATABASE SIMULASI (Mock DB)
let users = [];
let products = [
 { 
    id: 1, 
    name: "Ayam Geprek Gontory", 
    price: 15000, 
    img: "https://i.pinimg.com/736x/8c/eb/8b/8ceb8b5dda8551b87338938ad3a7a3d0.jpg", 
    desc: "Ayam geprek pedas mampus dengan nasi hangat." 
  },
  { 
    id: 2, 
    name: "Hoodie UNIDA", 
    price: 150000, 
    stock: 20,
    img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=60",
    desc: "Hoodie berkualitas dengan logo bordir UNIDA."
  },
  { 
    id: 3, 
    name: "Buku Catatan", 
    price: 25000, 
    stock: 100,
    img: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=500&q=60",
    desc: "Buku catatan aesthetic untuk kuliah."
  },
  { 
    id: 4, 
    name: "Es Teh Manis", 
    price: 3000, 
    stock: 200,
    img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=60",
    desc: "Segarnya es teh asli Solo." 
  }
];

// 6. ROUTE - AUTHENTICATION (Register & Login)

// Endpoint: Registrasi
app.post('/api/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  users.push({ email, password: hashedPassword, role: 'user' });
  res.status(201).json({ msg: "User Berhasil Terdaftar!" });
});

// Endpoint: Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user) return res.status(400).json({ msg: "User tidak ditemukan" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Password salah!" });

  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// 7. ROUTE - PRODUK & TRANSAKSI

// Middleware proteksi internal (Bisa pakai dari file auth.js atau yang di bawah ini)
const protect = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: "Akses ditolak, silakan login" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token tidak valid" });
  }
};

// Ambil Produk
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Checkout (Dilindungi Middleware)
app.post('/api/checkout', protect, (req, res) => {
  const { cartItems, totalHarga } = req.body;
  console.log(`Pesanan dari ${req.user.email} sebesar Rp ${totalHarga} sedang diproses...`);
  res.json({ 
    msg: "Checkout Berhasil!",
    orderId: "ORDER-" + Math.random().toString(36).substr(2, 9)
  });
});

// 8. JALANKAN SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=======================================`);
  console.log(`🚀 Backend UNIDA Mall Berjalan di: http://localhost:${PORT}`);
  console.log(`=======================================`);
});