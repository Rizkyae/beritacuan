<?php
require_once __DIR__ . '/config.php';
$faqs = fetch_rows($supabase, 'faqs', ['select' => '*', 'order' => 'order_num.asc']);
$pageTitle = 'Pertanyaan yang sering diajukan';
require __DIR__ . '/includes/header.php';
?>
<section class="container">
    <header class="page-head"><span class="section-kicker">Bantuan</span><h1>Pertanyaan umum.</h1><p>Jawaban ringkas untuk mengenal BERITA CUAN, produk digital, dan cara berkontribusi.</p></header>
    <div class="section" style="padding-top:10px"><div class="faq-list">
        <?php foreach ($faqs as $index => $faq): ?><div class="faq-item"><button class="faq-question" type="button" data-faq-button aria-expanded="false" aria-controls="faq-<?= (int) $index ?>"><span><?= e($faq['question']) ?></span><span data-faq-icon>+</span></button><div class="faq-answer" id="faq-<?= (int) $index ?>" hidden><?= nl2br(e($faq['answer'])) ?></div></div><?php endforeach; ?>
        <?php if ($faqs === []): ?><div class="empty-state">FAQ belum tersedia.</div><?php endif; ?>
    </div></div>
</section>
<?php require __DIR__ . '/includes/footer.php'; ?>
