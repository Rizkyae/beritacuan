# BERITA CUAN

Portal berita dan katalog produk digital. Seluruh tampilan publik dan panel admin menggunakan HTML statis dan JavaScript dengan Supabase Auth/REST API. PHP tidak diperlukan untuk halaman web.

## Struktur

```text
index.html, berita.html, produk.html, faq.html  Halaman publik statis
admin/*.html                                    Login dan dashboard admin statis
assets/css/                                     Gaya responsif
assets/js/site.js                               Navigasi dan footer publik
assets/js/public-pages.js                       Data dan tampilan publik
assets/js/supabase.js                           Konfigurasi publik Supabase
assets/js/admin.js                              Autentikasi dan CRUD admin
schema.sql                                      Tabel, RLS, dan fungsi Supabase
```

## Menampilkan halaman publik

1. Jalankan `schema.sql` di Supabase SQL Editor.
2. Buka `assets/js/supabase.js`, lalu isi `url` dengan Project URL dan `anonKey` dengan Supabase anon/publishable key. Isi `whatsappNumber` untuk tombol pembelian WhatsApp.
3. Unggah file proyek ke hosting statis atau letakkan di document root Laragon/XAMPP. Buka alamat folder proyek; halaman awal adalah `index.html`. Jangan membuka file lewat `file://`, karena browser membatasi request API lintas-origin.
4. Aktifkan domain website pada aturan API/CORS Supabase jika konfigurasi project Anda membatasi origin.

Anon/publishable key memang digunakan di browser. Jangan pernah mengisi `service_role` key; akses publik dibatasi oleh Row Level Security pada `schema.sql`.

## Panel admin (opsional)

Buka `/admin/login.html`. Login memakai Supabase Auth dan hanya mengizinkan akun dengan `profiles.role = 'admin'`. Dashboard dan pengelolaan berita, produk, serta FAQ berjalan lewat Supabase REST API; RLS tetap menjadi batas keamanan untuk setiap operasi.

Untuk membuat akun admin:

1. Buat akun di Supabase Authentication.
2. Promosikan akun di SQL Editor dengan email yang sama:

   ```sql
   update public.profiles set role = 'admin' where email = 'admin@contoh.com';
   ```

3. Login ke `/admin/login.html`. Sesi disimpan di `sessionStorage` dan dapat diperbarui memakai refresh token Supabase.

Frontend hanya memakai anon/publishable key; jangan pernah memasukkan `service_role` key. RLS memvalidasi role admin untuk operasi data. Fungsi `increment_post_views` hanya menambah jumlah pembacaan berdasarkan slug. URL admin yang benar adalah `/admin/login.html`; aturan rewrite Apache mengalihkan URL lama `/admin/login.php`.
