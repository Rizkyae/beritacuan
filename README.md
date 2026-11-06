# BERITA CUAN

Portal berita dan katalog produk digital. Halaman publik sekarang berupa HTML statis agar dapat ditayangkan oleh web hosting tanpa PHP. JavaScript mengambil konten publik dari Supabase REST API; panel admin tetap memerlukan PHP.

## Struktur

```text
index.html, berita.html, produk.html, faq.html  Halaman publik statis
assets/css/                                     Gaya responsif
assets/js/site.js                               Navigasi dan footer publik
assets/js/public-pages.js                       Data dan tampilan publik
assets/js/supabase.js                           Konfigurasi publik Supabase
admin/                                          Login, dashboard, dan CRUD PHP
app/                                            Klien Supabase REST dan helper PHP
includes/                                       Layout login admin
config.php                                      Konfigurasi backend admin
schema.sql                                      Tabel, RLS, dan fungsi Supabase
```

## Menampilkan halaman publik

1. Jalankan `schema.sql` di Supabase SQL Editor.
2. Buka `assets/js/supabase.js`, lalu isi `url` dengan Project URL dan `anonKey` dengan Supabase anon/publishable key. Isi `whatsappNumber` untuk tombol pembelian WhatsApp.
3. Unggah file proyek ke hosting statis atau letakkan di document root Laragon/XAMPP. Buka alamat folder proyek; halaman awal adalah `index.html`. Jangan membuka file lewat `file://`, karena browser membatasi request API lintas-origin.
4. Aktifkan domain website pada aturan API/CORS Supabase jika konfigurasi project Anda membatasi origin.

Anon/publishable key memang digunakan di browser. Jangan pernah mengisi `service_role` key; akses publik dibatasi oleh Row Level Security pada `schema.sql`.

## Panel admin (opsional)

Panel `/admin/login.php` dan endpoint PHP hanya berjalan di hosting yang mendukung PHP 8.1+ serta ekstensi `curl` dan `mbstring`. Hosting statis seperti GitHub Pages tidak menjalankan PHP, sehingga panel admin tidak akan berfungsi di sana.

Untuk memakai admin di Laragon/XAMPP:

1. Salin `.env.example` menjadi `.env` dan isi `SUPABASE_URL` serta `SUPABASE_ANON_KEY`. Jangan gunakan `service_role` key.
2. Buat akun di Supabase Authentication, lalu promosikan menjadi admin melalui SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where email = 'admin@contoh.com';
   ```

3. Buka `/admin/login.php`. Setelah login, CRUD berita, produk, FAQ, dan ringkasan views tersedia di dashboard.

PHP menggunakan Supabase Auth password grant dan access token pengguna. RLS memvalidasi role admin. Fungsi `increment_post_views` hanya menambah jumlah pembacaan berdasarkan slug.
