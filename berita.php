<?php
require_once __DIR__ . '/config.php';
$slug = isset($_GET['slug']) && is_string($_GET['slug']) ? trim($_GET['slug']) : '';
$category = isset($_GET['kategori']) && is_string($_GET['kategori']) ? trim($_GET['kategori']) : '';
$search = isset($_GET['q']) && is_string($_GET['q']) ? trim($_GET['q']) : '';
$validCategories = ['pilihan', 'politik', 'crypto', 'meme', 'meme_politik'];
$article = null;
if ($slug !== '') {
    $found = fetch_rows($supabase, 'posts', ['select' => '*', 'slug' => 'eq.' . $slug, 'limit' => '1']);
    $article = $found[0] ?? null;
    if ($article) {
        try {
            $supabase->request('POST', 'rpc/increment_post_views', ['post_slug' => $slug], null);
            $article['views'] = (int) ($article['views'] ?? 0) + 1;
        } catch (Throwable $exception) {
            error_log($exception->getMessage());
        }
    }
}
$query = ['select' => '*', 'order' => 'created_at.desc', 'limit' => '30'];
if ($category !== '' && in_array($category, $validCategories, true)) $query['category'] = 'eq.' . $category;
if ($search !== '') $query['title'] = 'ilike.*' . str_replace(['*', '%'], '', $search) . '*';
$posts = $slug === '' ? fetch_rows($supabase, 'posts', $query) : [];
$pageTitle = $article ? (string) $article['title'] : ($category !== '' ? category_label($category) : 'Semua berita');
require __DIR__ . '/includes/header.php';
?>
<?php if ($slug !== ''): ?>
    <?php if ($article): ?>
        <article class="article"><a class="category-pill" href="<?= e(url('berita.php?kategori=' . rawurlencode((string) $article['category']))) ?>"><?= e(category_label((string) $article['category'])) ?></a><h1><?= e($article['title']) ?></h1><div class="article-meta"><?= e(date('d M Y', strtotime((string) $article['created_at']))) ?> · <?= e(read_time($article['content'])) ?> · <?= number_format((int) ($article['views'] ?? 0)) ?> dibaca</div><?php if (!empty($article['thumbnail_url'])): ?><img src="<?= e($article['thumbnail_url']) ?>" alt="<?= e($article['title']) ?>"><?php endif; ?><div class="article-content"><?= nl2br(e($article['content'])) ?></div><p class="article-meta">Konten ini disediakan untuk informasi dan edukasi; bukan saran investasi.</p></article>
    <?php else: ?><section class="container section"><div class="empty-state">Berita tidak ditemukan atau belum tersedia.</div></section><?php endif; ?>
<?php else: ?>
    <section class="container">
        <header class="page-head"><span class="section-kicker">Dari redaksi</span><h1><?= e($search !== '' ? 'Hasil pencarian' : ($category !== '' && in_array($category, $validCategories, true) ? category_label($category) : 'Semua berita')) ?></h1><p><?= $search !== '' ? 'Hasil pencarian untuk “' . e($search) . '”.' : 'Analisis dan kabar terbaru yang dirangkum dengan konteks.' ?></p></header>
        <div class="filter-row"><?php foreach (['' => 'Semua', 'pilihan' => 'Berita Pilihan', 'politik' => 'Politik', 'crypto' => 'Crypto', 'meme' => 'Meme', 'meme_politik' => 'Meme Politik'] as $key => $label): ?><a class="filter-chip <?= $category === $key ? 'active' : '' ?>" href="<?= e(url('berita.php' . ($key !== '' ? '?kategori=' . $key : '')) ) ?>"><?= e($label) ?></a><?php endforeach; ?></div>
        <div class="section" style="padding-top:0"><div class="news-grid"><?php foreach ($posts as $post) render_post_card($post); ?></div><?php if ($posts === []): ?><div class="empty-state">Tidak ada berita yang cocok saat ini.</div><?php endif; ?></div>
    </section>
<?php endif; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>
