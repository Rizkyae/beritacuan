<?php
require_once dirname(__DIR__) . '/config.php';
require_admin();
$token = admin_token();
$posts = fetch_rows($supabase, 'posts', ['select' => 'id,title,category,views,created_at', 'order' => 'created_at.desc', 'limit' => '8'], $token);
$analytics = null;
try {
    $analytics = $supabase->request('GET', 'rpc/admin_analytics', null, $token);
} catch (Throwable $exception) {
    error_log($exception->getMessage());
}
$adminPage = 'dashboard';
$adminTitle = 'Ringkasan';
require __DIR__ . '/_layout.php';
?>
<?php if ($analytics === null): ?><div class="alert alert-error">Analytics belum dapat dimuat. Jalankan schema.sql versi terbaru di Supabase.</div><?php else: ?><div class="stats-grid"><div class="stat-card"><span>Total berita & meme</span><strong><?= number_format((int) $analytics['total_posts']) ?></strong></div><div class="stat-card"><span>Produk digital</span><strong><?= number_format((int) $analytics['total_products']) ?></strong></div><div class="stat-card"><span>Total pembacaan</span><strong><?= number_format((int) $analytics['total_views']) ?></strong></div></div><?php endif; ?>
<section class="admin-panel"><h2>Konten terbaru</h2><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Judul</th><th>Kategori</th><th>Views</th><th>Tanggal</th></tr></thead><tbody><?php foreach ($posts as $post): ?><tr><td><?= e($post['title']) ?></td><td><?= e(category_label((string) $post['category'])) ?></td><td><?= number_format((int) $post['views']) ?></td><td><?= e(date('d M Y', strtotime((string) $post['created_at']))) ?></td></tr><?php endforeach; ?><?php if ($posts === []): ?><tr><td colspan="4">Belum ada konten.</td></tr><?php endif; ?></tbody></table></div></section>
<?php require __DIR__ . '/_layout_end.php'; ?>
