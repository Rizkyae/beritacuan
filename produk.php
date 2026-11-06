<?php
require_once __DIR__ . '/config.php';
$products = fetch_rows($supabase, 'digital_products', ['select' => '*', 'order' => 'created_at.desc']);
$pageTitle = 'Produk digital';
require __DIR__ . '/includes/header.php';
?>
<section class="container">
    <header class="page-head"><span class="section-kicker">Belajar & berkarya</span><h1>Produk digital.</h1><p>Materi dan perangkat praktis untuk membantu perjalanan Anda. Periksa detail produk sebelum membeli.</p></header>
    <div class="section" style="padding-top:10px"><div class="product-grid">
        <?php foreach ($products as $product): $message = rawurlencode('Halo, saya tertarik dengan produk ' . $product['name'] . '.'); $href = WHATSAPP_NUMBER !== '' ? 'https://wa.me/' . preg_replace('/\D+/', '', WHATSAPP_NUMBER) . '?text=' . $message : (string) ($product['file_url'] ?? ''); ?>
            <article class="product-card"><?php if (!empty($product['thumbnail_url'])): ?><img src="<?= e($product['thumbnail_url']) ?>" alt="" style="width:100%;height:170px;object-fit:cover;border-radius:10px"><?php else: ?><div class="product-icon">↗</div><?php endif; ?><span class="category-pill" style="margin-top:16px">Produk digital</span><h3><?= e($product['name']) ?></h3><p><?= nl2br(e($product['description'])) ?></p><div class="product-price"><?= e(money($product['price'])) ?></div><a class="button button-green" href="<?= e($href !== '' ? $href : '#') ?>" <?= str_starts_with($href, 'https://') ? 'target="_blank" rel="noopener noreferrer"' : '' ?>>Beli Sekarang ↗</a></article>
        <?php endforeach; ?>
    </div><?php if ($products === []): ?><div class="empty-state">Produk digital belum tersedia.</div><?php endif; ?></div>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>
