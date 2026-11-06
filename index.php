<?php
require_once __DIR__ . '/config.php';
$posts = fetch_rows($supabase, 'posts', ['select' => '*', 'order' => 'created_at.desc', 'limit' => '12']);
$featured = array_values(array_filter($posts, static fn(array $post): bool => ($post['category'] ?? '') === 'pilihan'));
if ($featured === []) {
    $featured = $posts;
}
$politics = array_values(array_filter($posts, static fn(array $post): bool => ($post['category'] ?? '') === 'politik'));
$memes = array_values(array_filter($posts, static fn(array $post): bool => in_array(($post['category'] ?? ''), ['meme', 'meme_politik'], true)));
$products = fetch_rows($supabase, 'digital_products', ['select' => '*', 'order' => 'created_at.desc', 'limit' => '3']);
$faqs = fetch_rows($supabase, 'faqs', ['select' => '*', 'order' => 'order_num.asc', 'limit' => '4']);
$pageTitle = 'Berita pilihan hari ini';
$activePage = 'home';
require __DIR__ . '/includes/header.php';
?>
<section class="hero container">
    <span class="hero-kicker">Informasi, tanpa noise</span>
    <h1>Berita yang bikin<br><span>makin cuan.</span></h1>
    <p class="hero-copy">Perspektif segar tentang pasar, politik, dan kultur internet. Ringkas, relevan, dan tetap punya konteks.</p>
    <div class="hero-bottom"><a class="button button-dark" href="<?= e(url('berita.php')) ?>">Jelajahi berita <span>↗</span></a><a class="text-link" href="#tentang">Kenali BERITA CUAN ↓</a></div>
    <?php if ($featured !== []): ?>
        <div class="hero-grid">
            <?php $lead = $featured[0]; ?>
            <article class="hero-feature">
                <?php if (!empty($lead['thumbnail_url'])): ?><img src="<?= e($lead['thumbnail_url']) ?>" alt="" fetchpriority="high"><?php endif; ?>
                <div class="hero-feature-content"><span class="category-pill"><?= e(category_label((string) $lead['category'])) ?></span><h2><a href="<?= e(url('berita.php?slug=' . rawurlencode((string) $lead['slug']))) ?>"><?= e($lead['title']) ?></a></h2><div class="card-meta"><span><?= e(date('d M Y', strtotime((string) $lead['created_at']))) ?></span><span><?= number_format((int) ($lead['views'] ?? 0)) ?> dibaca</span></div></div>
            </article>
            <div class="hero-side">
                <?php foreach (array_slice($featured, 1, 2) as $post): ?>
                    <article class="hero-mini"><a class="hero-mini-image" href="<?= e(url('berita.php?slug=' . rawurlencode((string) $post['slug']))) ?>"><?php if (!empty($post['thumbnail_url'])): ?><img src="<?= e($post['thumbnail_url']) ?>" alt="" loading="lazy"><?php endif; ?></a><div><span class="category-pill"><?= e(category_label((string) $post['category'])) ?></span><h3><a href="<?= e(url('berita.php?slug=' . rawurlencode((string) $post['slug']))) ?>"><?= e($post['title']) ?></a></h3><span class="card-meta"><?= e(date('d M Y', strtotime((string) $post['created_at']))) ?></span></div></article>
                <?php endforeach; ?>
                <?php if (count($featured) < 2): ?><div class="hero-mini"><div><span class="category-pill">CERDAS FINANSIAL</span><h3>Ikuti perkembangan pasar dengan perspektif yang lebih jernih.</h3><a class="text-link" href="<?= e(url('berita.php?kategori=crypto')) ?>">Baca update pasar →</a></div></div><?php endif; ?>
            </div>
        </div>
    <?php else: ?>
        <div class="empty-state" style="margin-top:34px">Belum ada berita. Konten yang ditambahkan admin akan muncul di sini.</div>
    <?php endif; ?>
</section>
<section class="market-strip" aria-label="Ticker harga indikatif">
    <div class="container market-row"><span class="market-label">MARKET WATCH</span><span class="ticker-item">BTC <b>Harga via feed belum terhubung</b></span><span class="ticker-item">ETH <b>Harga via feed belum terhubung</b></span><span class="ticker-item">Informasi pasar untuk edukasi, bukan saran investasi.</span></div>
</section>
<section class="section container">
    <div class="section-heading"><div><span class="section-kicker">Pasar & aset digital</span><h2>Crypto, dibaca dengan konteks.</h2></div><a class="text-link" href="<?= e(url('berita.php?kategori=crypto')) ?>">Semua update →</a></div>
    <div class="news-grid"><?php $crypto = array_values(array_filter($posts, static fn(array $post): bool => ($post['category'] ?? '') === 'crypto')); foreach (array_slice($crypto, 0, 3) as $post) render_post_card($post); ?></div>
    <?php if ($crypto === []): ?><div class="empty-state">Update crypto akan muncul di sini saat tersedia.</div><?php endif; ?>
</section>
<section class="section container">
    <div class="section-heading"><div><span class="section-kicker">Lugas dan berimbang</span><h2>Politik tanpa basi.</h2></div><a class="text-link" href="<?= e(url('berita.php?kategori=politik')) ?>">Baca berita politik →</a></div>
    <div class="news-grid"><?php foreach (array_slice($politics, 0, 3) as $post) render_post_card($post); ?></div>
    <?php if ($politics === []): ?><div class="empty-state">Belum ada berita politik terbaru.</div><?php endif; ?>
</section>
<section class="section container">
    <div class="section-heading"><div><span class="section-kicker">Internet culture</span><h2>Meme & meme politik.</h2></div><a class="text-link" href="<?= e(url('berita.php?kategori=meme')) ?>">Lihat semua meme →</a></div>
    <div class="meme-grid">
        <?php foreach (array_slice($memes, 0, 3) as $meme): ?>
            <article class="meme-card"><?php if (!empty($meme['thumbnail_url'])): ?><a href="<?= e(url('berita.php?slug=' . rawurlencode((string) $meme['slug']))) ?>"><img src="<?= e($meme['thumbnail_url']) ?>" alt="" loading="lazy"></a><?php else: ?><div class="image-fallback" style="height:240px">Meme BERITA CUAN</div><?php endif; ?><div class="meme-content"><span class="category-pill"><?= e(category_label((string) $meme['category'])) ?></span><h3><a href="<?= e(url('berita.php?slug=' . rawurlencode((string) $meme['slug']))) ?>"><?= e($meme['title']) ?></a></h3><button class="reaction-button" type="button" data-reaction="<?= e($meme['id']) ?>" data-likes="0" aria-pressed="false">♡ <span data-reaction-count>0</span> suka</button></div></article>
        <?php endforeach; ?>
    </div>
    <?php if ($memes === []): ?><div class="empty-state">Meme segar segera hadir. Kirimkan ide Anda melalui kanal resmi kami.</div><?php endif; ?>
</section>
<section class="section container">
    <div class="section-heading"><div><span class="section-kicker">Belajar & berkarya</span><h2>Produk digital pilihan.</h2></div><a class="text-link" href="<?= e(url('produk.php')) ?>">Semua produk →</a></div>
    <div class="product-grid"><?php foreach ($products as $product): ?><article class="product-card"><div class="product-icon">↗</div><h3><?= e($product['name']) ?></h3><p><?= e($product['description']) ?></p><div class="product-price"><?= e(money($product['price'])) ?></div><a class="button button-green" href="<?= e(url('produk.php')) ?>">Lihat produk →</a></article><?php endforeach; ?></div>
    <?php if ($products === []): ?><div class="empty-state">Produk digital akan tampil setelah ditambahkan oleh admin.</div><?php endif; ?>
</section>
<section class="section container">
    <div class="section-heading"><div><span class="section-kicker">Yang sering ditanyakan</span><h2>FAQ.</h2></div><a class="text-link" href="<?= e(url('faq.php')) ?>">Lihat semua →</a></div>
    <div class="faq-list"><?php foreach ($faqs as $index => $faq): ?><div class="faq-item"><button class="faq-question" type="button" data-faq-button aria-expanded="false" aria-controls="home-faq-<?= (int) $index ?>"><span><?= e($faq['question']) ?></span><span data-faq-icon>+</span></button><div class="faq-answer" id="home-faq-<?= (int) $index ?>" hidden><?= nl2br(e($faq['answer'])) ?></div></div><?php endforeach; ?></div>
</section>
<section class="container section" id="tentang"><div class="about-band"><div><span class="section-kicker">Tentang kami</span><h2>Informasi lebih jernih, keputusan lebih cerdas.</h2><p>BERITA CUAN adalah portal independen yang merangkum isu pilihan seputar pasar, politik, dan budaya digital secara lugas. Konten kami bukan nasihat investasi.</p></div><a class="button button-dark" href="<?= e(url('faq.php')) ?>">Kenali kami →</a></div></section>
<?php require __DIR__ . '/includes/footer.php'; ?>
