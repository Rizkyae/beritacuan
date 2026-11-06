# BERITA CUAN

Portal berita dan katalog produk digital menggunakan PHP 8+, Supabase Auth/PostgreSQL REST API, Tailwind CDN, dan CSS responsif.

## Struktur

```text
admin/                 Login, dashboard, dan CRUD konten
app/                   Klien Supabase REST dan helper PHP
assets/css/            Gaya antarmuka
assets/js/             Tema, navigasi, FAQ, dan interaksi
includes/              Layout publik bersama
config.php             Konfigurasi aplikasi dari environment
index.php              Beranda
berita.php             Daftar berita dan artikel
produk.php             Katalog produk digital
faq.php                Daftar FAQ
schema.sql             Tabel, policies RLS, dan fungsi Supabase
```

## Menjalankan di Laragon/XAMPP

1. Letakkan folder ini di document root. URL aplikasi otomatis mengikuti path folder lokal; Anda dapat menetapkan `APP_URL` bila memakai domain khusus atau reverse proxy.
2. Salin `.env.example` menjadi `.env`, lalu isi `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan opsional `WHATSAPP_NUMBER`. Jangan gunakan `service_role` key.
3. Aktifkan ekstensi PHP `curl` dan `mbstring`, gunakan PHP 8.1 atau lebih baru.
4. Jalankan `schema.sql` di Supabase SQL Editor.
5. Buat akun melalui Supabase Authentication, lalu promosikan akun admin di SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where email = 'admin@contoh.com';
   ```

6. Buka `/admin/login.php`. Setelah masuk, kelola berita, produk, FAQ, dan ringkasan views dari dashboard.

## Catatan operasional

- PHP memakai Supabase Auth password grant dan membawa access token pengguna pada request REST. RLS memvalidasi role admin; kunci `service_role` tidak dibutuhkan dan tidak boleh dipasang di frontend.
- Fungsi `increment_post_views` hanya menambah views berdasarkan slug; kredensial publik tidak mendapat akses tulis langsung ke tabel.
- `assets/js/supabase.js` adalah tempat konfigurasi publik opsional untuk integrasi browser dan tidak menyimpan secret. Situs ini mengambil data publik dari PHP server.
- Tailwind CDN ditujukan untuk pengembangan/demo; untuk produksi, gunakan build Tailwind lokal. Gambar serta URL produk harus berasal dari sumber tepercaya.
- Tombol pembelian memakai nomor WhatsApp dari `WHATSAPP_NUMBER`; tanpa nomor tersebut, tautan `file_url` produk digunakan sebagai tujuan cadangan.
