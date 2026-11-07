# BERITA CUAN

Portal berita dan katalog produk digital. Seluruh tampilan publik dan panel admin menggunakan HTML statis dan JavaScript dengan Supabase Auth/REST API. PHP tidak diperlukan untuk halaman web.

## Struktur

```text
index.html, berita.html, produk.html, faq.html  Halaman publik statis
about.html, kebijakan-*.html                    About Us dan kebijakan publik
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

Menjalankan `schema.sql` juga membuat bucket publik `berita-cuan` dan kebijakan upload khusus admin. File gambar dibatasi 5 MB (JPG, PNG, WebP, GIF); file produk dibatasi 50 MB (PDF, ZIP, EPUB, DOCX, XLSX, PPTX, CSV, TXT). Formulir admin tetap menerima URL lama; bila file diunggah, unggahan akan menggantikan URL pada kolom terkait. File produk pada bucket publik dapat diakses melalui URL-nya, jadi jangan unggah materi yang harus dirahasiakan atau hanya boleh diakses setelah pembayaran.

## SEO, Google Search, dan AdSense

- Halaman publik menyediakan judul/deskripsi, canonical URL, dan Open Graph. Sitemap dinamis `/sitemap.xml` (XML) dan `/sitemap.txt` (URL teks per baris) dibuat dari halaman publik dan seluruh slug berita di Supabase, sehingga berita baru otomatis tercantum setelah dipublikasikan. Artikel memiliki URL bersih `/berita/<slug>` yang diarahkan ke halaman berita dan tetap mendukung tautan lama `berita.html?slug=...`. Artikel memakai judul, deskripsi SEO (atau cuplikan isi), canonical URL, dan structured data `NewsArticle` yang diisi saat artikel dimuat. Isi artikel berasal dari Supabase dan dirender di browser; Google perlu merender JavaScript untuk membaca isi berita.
- Pastikan domain produksi benar. Situs ini mengarahkan ke `https://www.beritacuan.my.id`; jika domain berbeda, perbarui URL di halaman publik, `robots.txt`, dan `sitemap.xml`.
- Tambahkan properti domain di Google Search Console, verifikasi kepemilikan, lalu kirim `https://www.beritacuan.my.id/sitemap.xml` satu kali. Sitemap dinamis memperkenalkan artikel baru saat Google mengambilnya lagi; Google menentukan jadwal crawl dan tidak menjamin setiap halaman diindeks, jadi pengindeksan tidak perlu diminta manual untuk setiap berita tetapi juga tidak langsung/terjamin.
- Untuk menayangkan iklan, terima situs di Google AdSense lalu isi `clientId` (`ca-pub-...`) dan `slotId` (ID unit iklan) di `assets/js/supabase.js`. Iklan tidak dimuat sebelum kedua ID valid. Penayangan tetap bergantung pada persetujuan Google dan kebijakan AdSense.

Market Watch halaman utama menampilkan BTC dan ETH melalui Binance Spot WebSocket dalam USDT; harga diperbarui saat data stream diterima dan koneksi mencoba tersambung kembali otomatis jika terputus. Ini adalah harga pada Binance, bukan harga konsolidasi seluruh bursa atau nasihat investasi.

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
