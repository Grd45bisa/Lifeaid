<p align="center">
  <img src="public/Logo-trans.webp alt="LifeAid Logo" width="200">
</p>

<h1 align="center">LifeAid - Medical Equipment E-Commerce</h1>

<p align="center">
  <strong>Website penjualan alat kesehatan Electric Patient Lifter dengan Admin Dashboard terintegrasi</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3ECF8E?style=flat-square&logo=supabase" alt="Supabase">
</p>

---

## 📋 Tentang Proyek

**LifeAid** adalah website e-commerce profesional untuk penjualan alat kesehatan, khususnya **Electric Patient Lifter** - alat bantu angkat pasien bertenaga listrik. Website ini dilengkapi dengan:

- 🛒 **Product Catalog** - Tampilan produk dengan detail lengkap
- 🌐 **Bilingual Support** - Indonesia & English
- 💬 **AI Chatbot** - Customer service otomatis
- 📊 **Admin Dashboard** - Manajemen produk, testimoni, dan pesan
- 🔐 **Supabase Auth** - Login admin dengan JWT

---

## ✨ Fitur Utama

### 🏠 Public Website
| Fitur | Deskripsi |
|-------|-----------|
| Hero Section | Landing page dengan animasi modern |
| Product Section | Featured product dengan tombol buy |
| Product Detail | Halaman detail produk dengan galeri gambar |
| Testimonials | Carousel testimoni pelanggan |
| Contact Form | Form kontak terintegrasi |
| Language Toggle | ID/EN dengan deteksi otomatis |

### 🔧 Admin Dashboard
| Fitur | Deskripsi |
|-------|-----------|
| Dashboard | Overview statistik website |
| Products | CRUD produk dengan gambar & markdown |
| Featured Product | Edit konten section unggulan |
| Testimonials | Kelola testimoni pelanggan |
| Messages | Inbox pesan dari form kontak |
| Chat History | Riwayat percakapan AI chatbot |
| Settings | Pengaturan database mode |
| Profile | Ubah email & password admin |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 atau lebih tinggi
- **npm** (included with Node.js)
- **Supabase account** (gratis di [supabase.com](https://supabase.com))

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Grd45bisa/Lifeaid.git

# 2. Masuk ke direktori
cd Lifeaid/frontend

# 3. Install dependencies
npm install

# 4. Copy environment file
cp .env.example .env

# 5. Edit .env dengan kredensial Supabase kamu
```

### Environment Variables

Buat file `.env` dengan isi:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

1. Buka Supabase Dashboard → SQL Editor
2. Jalankan script di `database/schema.sql`
3. Buat user admin di Authentication → Users → Add user

### Run Development Server

```bash
npm run dev
```

Buka `http://localhost:5173` di browser.

### Build Production

```bash
npm run build
```

Output di folder `dist/`.

---

## 📁 Struktur Proyek

```
frontend/
├── database/
│   └── schema.sql          # SQL schema lengkap
├── public/
│   └── *.svg, *.webp       # Assets statis
├── src/
│   ├── Components/
│   │   ├── Admin/          # Komponen admin (sidebar, layout)
│   │   ├── Hero.tsx        # Landing hero section
│   │   ├── Product.tsx     # Featured product section
│   │   ├── Testimonials.tsx
│   │   └── ...
│   ├── Pages/
│   │   ├── Admin/          # Halaman admin dashboard
│   │   ├── Home.tsx        # Homepage
│   │   └── ProductDetailPage.tsx
│   ├── utils/
│   │   └── supabaseClient.ts  # Supabase functions
│   └── App.tsx             # Router & layout
├── .env                    # Environment variables
└── package.json
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Library |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **React Router** | Navigation |
| **Supabase** | Backend (Auth + Database) |
| **CSS Modules** | Styling |

---

## 📖 Cara Penggunaan Admin

### Login Admin
1. Buka `/admin/login`
2. Masukkan email & password yang terdaftar di Supabase Auth

### Mengelola Produk
1. Buka Admin → Products
2. Klik "Add Product" untuk menambah produk baru
3. Isi form dengan detail produk (bilingual)
4. Upload gambar (max 5, drag untuk reorder)
5. Klik Save

### Mengelola Testimoni
1. Buka Admin → Testimonials
2. Tambah/edit testimoni
3. Set status Active untuk ditampilkan di homepage

### Pengaturan Database
1. Buka Admin → Settings
2. Nyalakan "Use Database Products"
3. Data produk & testimoni akan diambil dari database

---

## 📱 Responsive Design

Website dioptimalkan untuk semua ukuran layar:
- 📱 Mobile (< 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (> 1024px)

---

## 🤝 Contributing

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**LifeAid Indonesia**
- Website: [lifeaid.co.id](https://lifeaid.co.id)
- Email: info@lifeaid.co.id

---

<p align="center">
  Made with ❤️ in Indonesia
</p>
