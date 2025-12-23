# Rencana Implementasi Dashboard Admin Lifeaid & Prompt AI (Per Fase)

Dokumen ini berisi panduan implementasi yang dipecah per fase. **Gunakan prompt ini satu per satu** secara berurutan agar hasil coding lebih maksimal dan terfokus.

---

## FASE 0: Konteks & Pemahaman (JANGAN KERJAKAN DULU)

**Tujuan**: Memberikan konteks kepada AI agar paham gambaran besar proyek tanpa langsung menulis kode.

**Prompt untuk AI**:
```text
**Role**: Senior Frontend Developer (React + TypeScript)
**Context**:
Kita memiliki proyek website "Lifeaid" yang sudah berjalan (Frontend User). Sekarang kita ingin menambahkan **Admin Dashboard** untuk para admin mengelola situs.

**Goal Utama**:
Membuat Dashboard Admin yang terpisah, aman, dan fungsional.
Fitur utama yang paling prioritas adalah **Riwayat Chat** (melihat log percakapan antara User dan AI Assistant yang tersimpan di Supabase).

**Tech Stack**:
- React (Vite)
- TypeScript
- Tailwind / CSS Modules (Sesuai existing project)
- Supabase (Backend/Database)

**Instruksi**:
Tolong pelajari konteks ini. **JANGAN MENULIS KODE APAPUN DULU**.
Cukup konfirmasi bahwa kamu mengerti tujuan proyek ini dan siap menerima instruksi per fase (Fase 1 s/d 4) nanti.
Apakah kamu mengerti?
```

---

## FASE 1: Fondasi & Routing (Setup)

**Tujuan**: Menyiapkan struktur dasar halaman admin dan routing.

**Prompt untuk AI**:
```text
**Role**: Senior React Developer
**Task**: Implementasi Fase 1 - Fondasi Dashboard Admin Lifeaid

Tolong buatkan struktur dasar untuk Dashboard Admin dengan spesifikasi berikut:

1.  **Struktur Folder**:
    *   Buat folder `src/Pages/Admin` dan `src/Components/Admin`.
    *   Buat file `src/Pages/Admin/AdminDashboard.tsx` (Halaman utama dashboard, isi placeholder dulu).
2.  **Layout**:
    *   Buat `src/Components/Admin/AdminLayout.tsx`.
    *   Layout ini harus memiliki **Sidebar** tetap di sebelah kiri dan **Konten Utama** di sebelah kanan.
    *   Menu Sidebar: "Dashboard", "Riwayat Chat", "Logout".
    *   Gunakan styling CSS/Tailwind yang rapi dan profesional (dominasi warna biru/putih sesuai brand).
3.  **Routing**:
    *   Update `App.tsx`: Tambahkan rute `/admin/*` yang membungkus semua halaman admin dengan `AdminLayout`.
    *   Pastikan jika user akses `/admin`, mereka diarahkan ke dashboard.

Mohon berikan kode lengkap untuk `AdminLayout.tsx`, `AdminDashboard.tsx`, dan update untuk `App.tsx`.
```

---

## FASE 2: Autentikasi Sederhana

**Tujuan**: Mengamankan halaman admin agar tidak bisa diakses publik.

**Prompt untuk AI**:
```text
**Role**: Senior React Developer
**Task**: Implementasi Fase 2 - Autentikasi Admin Sederhana

Lanjutkan dari Fase 1. Sekarang kita butuh halaman Login sederhana untuk melindungi akses ke `/admin`.

1.  **Halaman Login**:
    *   Buat `src/Pages/Admin/AdminLogin.tsx`.
    *   Desain yang bersih: Logo Lifeaid di tengah, input username, input password, dan tombol login.
2.  **Logika Login (Simple)**:
    *   Gunakan kredensial hardcoded untuk saat ini (misal: Username: `admin`, Password: `lifeaid!@#$`).
    *   Gunakan `localStorage` atau `Context` untuk menyimpan status login (`isAdminLoggedIn`).
3.  **Proteksi Rute (Protected Route)**:
    *   Buat komponen `ProtectedRoute` yang membungkus rute `/admin`.
    *   Logika: Jika user belum login, redirect ke `/admin/login`. Jika sudah, izinkan akses.
    *   Update `App.tsx` untuk menggunakan proteksi ini.

Mohon berikan kode untuk `AdminLogin.tsx` dan cara integrasi `ProtectedRoute` ke `App.tsx`.
```

---

## FASE 3: Integrasi Data & Riwayat Chat (Inti)

**Tujuan**: Menampilkan data chat dari Supabase.

**Prompt untuk AI**:
```text
**Role**: Senior React Developer
**Task**: Implementasi Fase 3 - Riwayat Chat Integrasi Supabase

Fitur utama dashboard ini adalah melihat riwayat chat user.
Data tersimpan di Supabase tabel `chat_memory` (kolom: `session_id`, `role`, `content`, `metadata`).

1.  **Halaman List Chat** (`AdminChatHistory.tsx`):
    *   Buat halaman ini di folder Admin.
    *   Ambil data dari Supabase: `select distinct session_id, metadata, created_at from chat_memory order by created_at desc`.
    *   Tampilkan dalam **Tabel**:
        *   Waktu (Format tanggal yang mudah dibaca)
        *   Nama User & Email (Ambil dari kolom `metadata` JSONB).
        *   Status/Preview pesan terakhir.
        *   Tombol "Lihat Detail".
2.  **Halaman Detail Chat** (`AdminChatDetail.tsx`):
    *   Saat tombol "Lihat Detail" diklik, buka halaman detail chat.
    *   Ambil semua pesan untuk `session_id` tersebut.
    *   Render pesan dalam bentuk UI Bubble Chat (Kiri: User, Kanan: Assistant). Gunakan styling yang mirip dengan `WhatsAppBubbleChat.tsx` agar konsisten.

Mohon berikan kode untuk `AdminChatHistory.tsx` dan `AdminChatDetail.tsx` serta fungsi fetch data ke Supabase.
```

---

## FASE 4: UI Polish & Dashboard Widget

**Tujuan**: Mempercantik tampilan dan menambahkan ringkasan data.

**Prompt untuk AI**:
```text
**Role**: Senior Frontend Developer
**Task**: Implementasi Fase 4 - Final Polish & Dashboard Widgets

Terakhir, mari kita percantik `AdminDashboard.tsx` (Halaman Home Admin).

1.  **Statistik Cards**:
    *   Tampilkan 3 kartu ringkasan di bagian atas dashboard:
        *   "Total Percakapan" (Hitung jumlah session unik).
        *   "Total Leads" (Hitung jumlah user dengan email unik).
        *   "Pesan Hari Ini".
2.  **UI Polish**:
    *   Pastikan transisi antar halaman admin halus.
    *   Pastikan tabel di Riwayat Chat responsif (bisa di-scroll horizontal jika di mobile).
    *   Tambahkan tombol "Refresh Data" di halaman list chat.

Mohon berikan update kode untuk `AdminDashboard.tsx` dengan fitur statistik tersebut.
```
