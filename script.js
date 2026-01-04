    // DATA MOCKUP (Integrasi Backend simulation)
let products = [];

    let cart = JSON.parse(localStorage.getItem('unida_cart')) || [];

    // NAVIGATION SYSTEM (SPA)
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        window.scrollTo(0,0);
    }

    async function ambilDataProduk() {
    const list = document.getElementById('product-list');
    list.innerHTML = "<div class='loading'>Sedang memuat menu lezat...</div>";

    try {
        const response = await fetch('https://latihanbackendku.vercel.app/api/products');
        const data = await response.json();
        
        // SINKRONISASI: Masukkan data server ke variabel global
        products = data; 
        
        renderKatalog(products); 
        console.log("Data berhasil diambil dari server!");
    } catch (error) {
        console.error("Gagal ambil data:", error);
        list.innerHTML = "<p style='color:red;'>Gagal mengambil data. Pastikan Backend (node server.js) sudah dinyalakan.</p>";
    }
    }
    
    // RENDER KATALOG
    function renderKatalog(data = products) {
        const list = document.getElementById('product-list');
        list.innerHTML = data.map(p => `
            <div class="card" onclick="showDetail(${p.id})">
                <img src="${p.img}" onerror="this.src='https://placehold.co/300x300?text=Gambar+Error'">
                <div class="card-body">
                    <h3>${p.name}</h3>
                    <p class="price">Rp ${p.price.toLocaleString()}</p>
                    <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart(${p.id})">Beli</button>
                </div>
            </div>
        `).join('');
    }

    // DETAIL PRODUK
    function showDetail(id) {
        const p = products.find(prod => prod.id === id);
        const content = document.getElementById('detail-content');
        content.innerHTML = `
            <button onclick="showPage('katalog')" style="margin-bottom:20px; border:none; cursor:pointer;">← Kembali</button>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
                <img src="${p.img}" style="width:100%; border-radius:20px;">
                <div>
                    <h1>${p.name}</h1>
                    <p class="price" style="font-size: 2rem;">Rp ${p.price.toLocaleString()}</p>
                    <p style="margin: 20px 0;">${p.desc}</p>
                    <button class="btn btn-primary" onclick="addToCart(${p.id})">Tambah ke Keranjang</button>
                </div>
            </div>
        `;
        showPage('detail');
    }

    // CARING SYSTEM
    function addToCart(id) {
        const p = products.find(prod => prod.id === id);
        cart.push(p);
        saveCart();
        updateCartCount();
        alert(`${p.name} masuk keranjang!`);
    }

    function saveCart() {
        localStorage.setItem('unida_cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        document.getElementById('cart-count').innerText = cart.length;
    }

    function openCart() {
        const modal = document.getElementById('cartModal');
        const items = document.getElementById('cart-items');
        const totalEl = document.getElementById('cart-total');
        
        let total = 0;
        items.innerHTML = cart.map((item, index) => {
            total += item.price;
            return `<div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>${item.name}</span>
                <span>Rp ${item.price.toLocaleString()} <button onclick="removeItem(${index})" style="color:red; border:none; background:none; cursor:pointer;">x</button></span>
            </div>`;
        }).join('');
        
        totalEl.innerText = `Total: Rp ${total.toLocaleString()}`;
        modal.style.display = 'flex';
    }

    function removeItem(index) {
        cart.splice(index, 1);
        saveCart();
        updateCartCount();
        openCart();
    }

    function closeCart() { document.getElementById('cartModal').style.display = 'none'; }

    // INTEGRASI WHATSAPP (Simulasi Kirim Data)
    async function checkoutSistem() {
    if(cart.length === 0) {
        alert("Keranjang masih kosong, Akhi/Ukhti!");
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Antum belum login! Silakan login dulu untuk melakukan pemesanan.");
        showPage('login');
        closeCart();
        return;
    }

    let total = cart.reduce((sum, item) => sum + item.price, 0);

    try {
        // 1. LAPOR KE BACKEND (Simpan Transaksi & Cek Token)
        const response = await fetch('https://latihanbackendku.vercel.app/api/checkout', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ 
                cartItems: cart, 
                totalHarga: total 
            })
        });

        const data = await response.json();

        if (response.ok) {
            // 2. JIKA SERVER OKE, LANJUT KIRIM WHATSAPP SEBAGAI NOTIFIKASI
            let msg = `Halo Admin UNIDA Mall!%0A`;
            msg += `Saya sudah checkout via Web.%0A`;
            msg += `Order ID: *${data.orderId}*%0A%0A`;
            msg += `*Pesanan:*%0A`;
            cart.forEach(i => {
                msg += `- ${i.name} (Rp ${i.price.toLocaleString()})%0A`;
            });
            msg += `%0ATotal Bayar: *Rp ${total.toLocaleString()}*`;

            alert("Syukron! Pesanan antum tercatat di sistem.");
            window.open(`https://wa.me/628123456789?text=${msg}`);

            // 3. BERSIHKAN KERANJANG
            cart = []; 
            saveCart(); 
            updateCartCount(); 
            closeCart();
            showPage('katalog');
        } else {
            alert("Gagal Checkout: " + data.msg);
        }
    } catch (error) {
        alert("Gagal terhubung ke server. Pastikan backend 'node server.js' menyala!");
    }
}

    // SEARCH FILTER
    function filterProduk() {
        const val = document.getElementById('searchBar').value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(val));
        renderKatalog(filtered);
    }


window.onload = () => {
    ambilDataProduk();
    updateCartCount();
};
        
        // Form Login Handler
       document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // --- 1. VALIDASI LOKAL (Dari kode lama antum) ---
    if (!emailRegex.test(email)) {
        alert("Astagfirullah! Format email antum salah.");
        return;
    }

    if (password.length < 8) {
        alert("Password minimal harus 8 karakter demi keamanan!");
        return;
    }

    // --- 2. CEK KE SERVER (Dari kode baru saya) ---
    try {
        const response = await fetch('https://latihanbackendku.vercel.app/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Berhasil login secara nyata
            localStorage.setItem('token', data.token); 
            localStorage.setItem('user_session', email);
            
            alert("Syukron! Login berhasil.");
            showPage('dashboard');
        } else {
            // Server bilang email/pass salah
            alert("Gagal: " + data.msg);
        }
    } catch (error) {
        alert("Server mati! Nyalain dulu di CMD pakai 'node server.js'");
    }
});
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    if (pageId === 'dashboard') {
        const emailAsli = localStorage.getItem('user_session');
        
        if (emailAsli) {
            // Tampilkan nama di Judul (contoh: mahasiswa)
            document.getElementById('welcome-user').innerText = `Ahlan, ${emailAsli.split('@')[0]}!`;
            
            // Tampilkan email lengkap di info profil
            document.getElementById('display-email').innerText = emailAsli;
        } else {
            // Jika belum login tapi maksa buka dashboard, tendang ke login
            alert("Harap login terlebih dahulu!");
            showPage('login');
        }
    }
}
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_session');
    localStorage.removeItem('unida_cart'); // Opsional: hapus keranjang saat logout
    alert("Antum berhasil keluar. Sampai jumpa lagi!");
    location.reload(); // Refresh halaman untuk reset semua state

}
