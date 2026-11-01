# Supabase Integration — Tidurlah Store

> Dokumentasi integrasi Supabase sebagai database utama untuk Tidurlah Store.  
> Pengganti Google Sheets dengan arsitektur yang lebih modern, cepat, dan scalable.

---

## Ringkasan

Seluruh data yang sebelumnya disimpan di **Google Sheets** telah **100% dimigrasikan** ke **Supabase** (PostgreSQL) sebagai database utama. Google Sheets tetap menerima data baru sebagai **backup otomatis** — tidak ada data lama yang dihapus.

### Status Migrasi: ✅ SELESAI

**Terakhir dijalankan:** 11 April 2026, ±21:00 WIB

| Data                               | Jumlah | Status                                                                    |
| ---------------------------------- | ------ | ------------------------------------------------------------------------- |
| Pesanan (orders)                   | 564    | ✅ Dimigrasikan dari Google Sheets                                        |
| Item pesanan (order_items)         | 765    | ✅ Dimigrasikan dari Google Sheets                                        |
| Data pengiriman (order_deliveries) | 1      | ✅ Dimigrasikan dari Google Sheets                                        |
| Produk (products)                  | 50     | ✅ Di-seed dari seed.sql                                                  |
| Kode promo (promo_codes)           | 6      | ✅ Di-seed dari seed.sql                                                  |
| User admin (profiles)              | 1      | ✅ Dibuat manual                                                          |
| **Gambar produk**                  | —      | Tetap di `/public/product-image/` (static asset, tidak perlu di Supabase) |

### Apa yang berubah?

| Fitur                    | Sebelumnya                    | Sekarang                                                       |
| ------------------------ | ----------------------------- | -------------------------------------------------------------- |
| Database pesanan         | Google Sheets                 | **Supabase** (primary) + Google Sheets (backup)                |
| Katalog produk           | `products.json` (static file) | **Supabase `products` table** (admin-editable) + JSON fallback |
| Kode promo               | Hardcoded di kode program     | **Supabase `promo_codes` table** (admin-editable)              |
| Login admin/kasir        | Tidak ada                     | **Supabase Auth** (email + password)                           |
| Upload file (CV lamaran) | Google Sheets (base64)        | **Supabase Storage** (proper file storage)                     |
| Notifikasi pesanan baru  | Tidak ada                     | **Supabase Realtime** (notifikasi langsung di dashboard)       |
| Laporan & dashboard      | Google Sheets query (lambat)  | **Supabase RPC** (SQL function, cepat)                         |

### Apa yang TIDAK berubah?

- **Data lama di Google Sheets tetap aman** — tidak dihapus, tidak dimodifikasi
- **Google Sheets tetap menerima data baru** — sebagai backup otomatis (write-only)
- **Website tetap bisa jalan** tanpa Supabase (fallback otomatis ke Google Sheets/JSON)
- **Tampilan website & POS** tidak berubah
- **Gambar produk** tetap disimpan sebagai file statis di `/public/product-image/` (lebih cepat, tanpa biaya storage tambahan)

---

## Arsitektur

### Baca Data (Read)

Semua pembacaan data menggunakan **Supabase sebagai sumber utama**. Google Sheets hanya dipakai jika Supabase error/tidak tersedia:

```
User/Admin buka halaman
        │
        ▼
┌──────────────────┐
│  1. Supabase     │ ← Sumber utama (cepat, real-time)
│     (Primary)    │
└────────┬─────────┘
         │ Jika gagal/error
         ▼
┌──────────────────┐
│  2. Google Sheets│ ← Fallback otomatis
│     (Backup)     │
└──────────────────┘
```

### Tulis Data (Write) — Dual-Write Pattern

Setiap kali ada data baru (pesanan, lamaran kerja, survey), sistem menulis ke **dua tempat**:

```
User melakukan aksi (order, dll.)
        │
        ▼
┌──────────────────┐
│  1. Supabase     │ ← Database utama (cepat, real-time)
│     (Primary)    │
└──────────────────┘
        │
        ▼
┌──────────────────┐
│  2. Google Sheets│ ← Backup otomatis (selalu ditulis)
│     (Backup)     │
└──────────────────┘
```

**Jika Supabase gagal** (misalnya server down), data **tetap masuk ke Google Sheets** seperti biasa. Tidak ada data yang hilang.

---

## Fitur Lengkap

### 1. Autentikasi (Login)

- Halaman login di `/login`
- Dua role: **Admin** dan **Kasir**
- Admin bisa akses semua fitur di `/admin`
- Kasir hanya bisa akses POS di `/cashier`
- Session otomatis bertahan (tidak perlu login ulang setiap buka browser)

### 2. Manajemen Produk

- Admin bisa **tambah, edit, hapus produk** langsung dari dashboard
- Tidak perlu edit file JSON lagi
- Perubahan langsung tampil di website
- Jika Supabase belum diatur, website otomatis pakai `products.json` sebagai fallback

### 3. Manajemen Kode Promo

- Admin bisa **buat, edit, hapus kode promo** dari dashboard
- Mendukung dua jenis promo:
  - **Percentage** — diskon persentase (contoh: DISCOUNT10 = 10% off)
  - **Override** — harga spesial per produk (contoh: HUT3TH = harga khusus)
- Bisa set produk tertentu, kuantitas minimum, batas penggunaan, tanggal berlaku

### 4. Sistem Pesanan

- Pesanan dari **website** dan **POS** masuk ke Supabase
- Setiap pesanan otomatis mendapat **invoice number** (INV-YYMMDD-XXXXX)
- Admin bisa:
  - Update status pesanan (pending → partial → done → cancelled)
  - Assign designer untuk jasa desain
  - Soft-delete pesanan (bisa di-restore)
  - Edit pesanan yang sudah ada

### 5. Dashboard & Laporan

- **Dashboard real-time**: jumlah pesanan & pendapatan hari ini, minggu ini, bulan ini
- **Laporan bulanan**: breakdown harian, produk terlaris, performa kasir
- Data dihitung langsung di database (cepat, tidak perlu load semua baris)

### 6. Notifikasi Real-time

- Dashboard admin otomatis menampilkan **notifikasi** setiap ada pesanan baru
- Termasuk suara notifikasi
- Auto-reconnect jika koneksi terputus

### 7. Upload File

- Lamaran kerja (`/loker`) kini bisa upload CV ke Supabase Storage
- File tersimpan aman, bisa didownload oleh admin

---

## Setup Supabase (✅ SELESAI)

### Yang sudah dijalankan:

1. ✅ **Database schema** — Semua tabel sudah dibuat via `supabase/setup.sql`:
   - `profiles` — Data user (admin/kasir)
   - `products` — Katalog produk
   - `promo_codes` — Kode promo
   - `orders` — Pesanan
   - `order_items` — Item per pesanan
   - `order_deliveries` — Data pengiriman
   - `job_applications` — Lamaran kerja
   - `survey_responses` — Respons survey

2. ✅ **Seed data** — 50 produk + 6 kode promo sudah dimasukkan

3. ✅ **Migrasi data historis** — 564 pesanan + 765 item dari Google Sheets sudah dimigrasikan via `scripts/migrate-sheets-to-supabase.ts`

4. ✅ **Row Level Security (RLS)** — Semua tabel dilindungi:
   - Publik hanya bisa: lihat produk aktif, lihat promo aktif, submit pesanan/lamaran/survey
   - Staff (admin + kasir) bisa: lihat semua pesanan, update status
   - Admin saja bisa: kelola produk, promo, hapus pesanan

5. ✅ **Storage bucket** — Bucket `applications` untuk upload CV

6. ✅ **Realtime** — Tabel `orders` sudah di-publish untuk notifikasi real-time

7. ✅ **User admin** — Sudah dibuat dan bisa login di `/login`

### Menambah user kasir baru

1. Buka Supabase Dashboard → **Authentication** → **Users** → **Add user**
2. Isi:
   - **Email**: email kasir
   - **Password**: password yang kuat
   - **User Metadata** (JSON):
     ```json
     { "full_name": "Nama Kasir", "role": "cashier" }
     ```
3. Klik **Create user**
4. Profile otomatis terbuat dengan role `cashier`

---

## Environment Variables

File `.env.local` harus berisi:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

> **Catatan**: `PUBLISHABLE_KEY` adalah **anon/public key** dari Supabase, bukan service_role key. Aman untuk dipakai di frontend.

Dapatkan dari: [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api)

---

## Keamanan

| Layer                  | Perlindungan                                                               |
| ---------------------- | -------------------------------------------------------------------------- |
| **Row Level Security** | Setiap tabel punya RLS policy — user hanya bisa akses data sesuai role-nya |
| **Auth**               | Login via email/password, session JWT, auto-refresh token                  |
| **Protected Routes**   | `/admin` hanya untuk admin, `/cashier` untuk admin + kasir                 |
| **Request Timeout**    | Semua request ke Supabase punya timeout 15 detik                           |
| **Error Boundary**     | Jika terjadi error, app menampilkan halaman recovery (tidak crash)         |
| **Fallback**           | Jika Supabase down, app otomatis pakai Google Sheets/JSON                  |

---

## Struktur File Terkait

```
supabase/
├── migrations/
│   ├── 001_profiles.sql      # Tabel profiles + auth trigger
│   ├── 002_products.sql       # Tabel products + promo_codes
│   ├── 003_orders.sql         # Tabel orders + items + deliveries + RPC functions
│   ├── 004_applications.sql   # Tabel job_applications + survey_responses
│   └── 005_alter_applications.sql  # Alter + storage bucket
├── seed.sql                   # Data awal (50 produk + 6 promo)
└── setup.sql                  # Combined script (semua migration + seed)

scripts/
└── migrate-sheets-to-supabase.ts  # Migrasi data historis dari Google Sheets

src/
├── lib/
│   └── supabase.ts            # Supabase client (dengan timeout & fallback)
├── services/
│   ├── orders.ts              # CRUD pesanan di Supabase
│   ├── products.ts            # CRUD produk + promo di Supabase
│   ├── admin.ts               # Dashboard & laporan (RPC)
│   ├── applications.ts        # Lamaran kerja
│   └── storage.ts             # Upload file
├── contexts/
│   └── AuthContext.tsx         # Login state & role management
├── hooks/
│   └── useOrderNotifications.ts  # Realtime order notifications
├── components/common/
│   ├── ProtectedRoute.tsx     # Route guard berdasarkan role
│   └── ErrorBoundary.tsx      # Error recovery UI
└── utils/
    ├── api.ts                 # Dual-write: Supabase + Google Sheets
    └── adminApi.ts            # Admin operations (dual-write)
```

---

## FAQ

### Apakah data lama di Google Sheets akan hilang?

**Tidak.** Google Sheets tetap menerima semua data baru sebagai backup. Data lama tidak disentuh sama sekali. Semua data historis (564 pesanan) sudah disalin ke Supabase.

### Apakah semua data sudah 100% di Supabase?

**Ya.** Semua pesanan historis dari Google Sheets sudah dimigrasikan. Supabase adalah satu-satunya sumber data untuk membaca (read). Google Sheets hanya menerima backup tulis (write) untuk pesanan baru.

### Bagaimana dengan gambar produk?

Gambar produk tetap disimpan di `/public/product-image/` sebagai file statis. Ini lebih optimal — gambar di-serve langsung dari hosting (Netlify/Vercel) tanpa biaya storage Supabase tambahan.

### Apakah website tetap bisa jalan tanpa Supabase?

**Ya.** Semua fitur punya fallback otomatis ke Google Sheets atau file JSON. Jika Supabase mati, website tetap berfungsi normal.

### Bagaimana jika ingin kembali ke Google Sheets saja?

Cukup hapus `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` dari `.env.local`. Sistem otomatis 100% pakai Google Sheets lagi.

### Bagaimana cara migrasi ulang data dari Google Sheets?

Jalankan migration script (aman dijalankan berulang kali — otomatis skip data yang sudah ada):

```bash
ADMIN_PASSWORD=yourpassword npx tsx scripts/migrate-sheets-to-supabase.ts
```

### Berapa biaya Supabase?

Supabase Free Plan sudah cukup untuk kebutuhan saat ini:

- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- Unlimited API requests

### Bagaimana cara menambah produk sekarang?

Login sebagai admin di `/login`, lalu buka `/admin` → tab **Products** → klik **Tambah Produk**.

### Bagaimana cara menambah kode promo?

Login sebagai admin → `/admin` → tab **Promos** → klik **Tambah Promo**.

---

## Panduan Operasional Supabase Dashboard

> Akses dashboard di: [https://supabase.com/dashboard](https://supabase.com/dashboard)  
> Login dengan akun yang digunakan saat membuat project Supabase.

### 1. Melihat & Mengelola Data (Table Editor)

**Menu: Table Editor** (ikon tabel di sidebar kiri)

Di sini Anda bisa melihat semua tabel dan data secara langsung:

| Tabel              | Isi                     | Yang bisa dilakukan               |
| ------------------ | ----------------------- | --------------------------------- |
| `orders`           | Semua pesanan           | Lihat, filter, edit status, hapus |
| `order_items`      | Detail item per pesanan | Lihat item pesanan tertentu       |
| `order_deliveries` | Data pengiriman         | Lihat/edit alamat & status kirim  |
| `products`         | Katalog produk          | Tambah/edit/hapus produk          |
| `promo_codes`      | Kode promo              | Tambah/edit/hapus promo           |
| `profiles`         | Data user (admin/kasir) | Lihat/edit role user              |

**Tips:**

- Klik nama tabel → lihat semua data
- Klik **Filter** → filter berdasarkan kolom (misal: `order_status = done`)
- Klik **Sort** → urutkan berdasarkan kolom (misal: `timestamp` descending)
- Klik baris → edit data langsung
- Klik **Insert row** → tambah data baru manual
- **Jangan hapus data dari sini kecuali benar-benar perlu** — gunakan admin dashboard di `/admin` untuk operasi sehari-hari

### 2. Mengelola User (Authentication)

**Menu: Authentication** (ikon kunci di sidebar kiri)

#### Melihat semua user

- Klik **Users** → daftar semua user yang terdaftar
- Terlihat: email, created at, last sign in, provider

#### Menambah user baru (admin/kasir)

1. Klik **Add user** → **Create new user**
2. Isi:
   - **Email**: email user baru
   - **Password**: minimal 6 karakter
   - **Auto Confirm User**: ✅ centang (agar tidak perlu verifikasi email)
3. Klik **Create user**
4. Setelah user dibuat, klik user tersebut → scroll ke **User Metadata**
5. Tambahkan metadata:
   ```json
   {
     "full_name": "Nama Lengkap",
     "role": "admin"
   }
   ```
   Ganti `"admin"` dengan `"cashier"` untuk kasir.
6. Klik **Save**

#### Mengubah role user

1. **Authentication** → **Users** → klik user
2. Edit **User Metadata** → ubah `"role"` ke `"admin"` atau `"cashier"`
3. Klik **Save**
4. Juga update di **Table Editor** → `profiles` → cari user → ubah kolom `role`

#### Menghapus user

1. **Authentication** → **Users** → klik user → **Delete user**
2. ⚠️ **Hati-hati**: ini permanen, user tidak bisa login lagi

#### Reset password user

1. **Authentication** → **Users** → klik user
2. Tidak ada tombol reset langsung — caranya:
   - Hapus user lama
   - Buat user baru dengan email yang sama dan password baru

### 3. Menjalankan SQL Manual (SQL Editor)

**Menu: SQL Editor** (ikon terminal di sidebar kiri)

Berguna untuk operasi lanjutan yang tidak bisa dilakukan dari Table Editor:

#### Contoh: Lihat 10 pesanan terbaru

```sql
SELECT order_id, customer_name, total, order_status, timestamp
FROM orders
WHERE deleted_at IS NULL
ORDER BY timestamp DESC
LIMIT 10;
```

#### Contoh: Cari pesanan berdasarkan nama customer

```sql
SELECT * FROM orders
WHERE customer_name ILIKE '%nama customer%'
AND deleted_at IS NULL;
```

#### Contoh: Total pendapatan bulan ini

```sql
SELECT COUNT(*) AS total_pesanan, SUM(total) AS total_pendapatan
FROM orders
WHERE deleted_at IS NULL
AND timestamp >= date_trunc('month', now());
```

#### Contoh: Ubah role user ke admin

```sql
-- 1. Update di auth metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'email@contoh.com';

-- 2. Update di profiles table
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email@contoh.com';
```

#### Contoh: Jalankan migrasi ulang (jika tabel belum ada)

- Klik **New query**
- Copy-paste isi file `supabase/setup.sql`
- Klik **Run**

### 4. Monitoring & Log

**Menu: Logs** (ikon dokumen di sidebar kiri)

- **API Logs** → lihat semua request ke Supabase (berguna untuk debugging)
- **Auth Logs** → lihat aktivitas login/logout
- **Postgres Logs** → lihat query database

**Menu: Reports** (jika tersedia)

- Lihat statistik penggunaan: jumlah request, storage usage, dll.

### 5. Storage (File Upload)

**Menu: Storage** (ikon folder di sidebar kiri)

- Bucket `applications` → berisi file CV dari lamaran kerja
- Klik file → **Download** atau **Delete**
- File di-upload otomatis oleh website saat user submit lamaran di `/loker`

### 6. Settings Penting

**Menu: Project Settings** (ikon gear di sidebar kiri)

#### API Keys (Settings → API)

- **anon/public key** → dipakai di `.env.local` sebagai `VITE_SUPABASE_PUBLISHABLE_KEY`
- **service_role key** → ⚠️ JANGAN share atau taruh di frontend! Hanya untuk server/script
- **Project URL** → dipakai sebagai `VITE_SUPABASE_URL`

#### Database (Settings → Database)

- **Connection string** → untuk connect dari tools lain (DBeaver, pgAdmin, dll.)
- **Password** → password database PostgreSQL

### 7. Backup & Recovery

Supabase Free Plan menyediakan:

- **Point-in-time recovery** → bisa restore database ke waktu tertentu (7 hari terakhir)
- **Daily backups** → otomatis setiap hari

Untuk backup manual:

1. **Settings** → **Database** → **Backups**
2. Download backup terbaru

Selain itu, Google Sheets tetap menerima semua data baru sebagai backup tambahan.

### 8. Troubleshooting Umum

| Masalah                       | Solusi                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| User tidak bisa login         | Cek di **Authentication** → **Users** apakah user ada dan metadata `role` sudah diset  |
| Data tidak muncul di admin    | Cek di **Table Editor** → `orders` apakah data ada. Cek **Logs** → **API** untuk error |
| Website lambat                | Cek **Reports** untuk usage. Free plan punya limit bandwidth                           |
| RLS error (permission denied) | Cek **Authentication** → pastikan user sudah login dan role-nya benar                  |
| "Infinite recursion" error    | Jangan edit RLS policies manual kecuali paham. Gunakan `setup.sql` sebagai referensi   |
| Perlu re-migrasi dari Sheets  | Jalankan: `ADMIN_PASSWORD=pass npx tsx scripts/migrate-sheets-to-supabase.ts`          |
