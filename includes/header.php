<?php
$pageTitle = $pageTitle ?? 'Berita finansial, politik & kultur internet';
$activePage = $activePage ?? '';
?>
<!doctype html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="BERITA CUAN — berita pilihan tentang pasar, politik, dan kultur internet.">
    <title><?= e($pageTitle) ?> — <?= e(APP_NAME) ?></title>
    <script>
        (() => {
            const saved = localStorage.getItem('bc-theme');
            const theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.documentElement.dataset.theme = theme;
        })();
        tailwind = { config: { darkMode: ['class', '[data-theme="dark"]'] } };
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= e(url('assets/css/app.css')) ?>">
    <script defer src="<?= e(url('assets/js/app.js')) ?>"></script>
</head>
<body>
<header class="site-header">
    <div class="container nav-wrap">
        <a class="brand" href="<?= e(url()) ?>" aria-label="BERITA CUAN beranda"><span class="brand-mark">B<span>.</span></span><span>BERITA <b>CUAN</b></span></a>
        <button class="mobile-menu-button" type="button" aria-label="Buka navigasi" aria-expanded="false" data-menu-toggle>☰</button>
        <nav class="main-nav" data-menu>
            <a class="<?= $activePage === 'home' ? 'active' : '' ?>" href="<?= e(url()) ?>">Beranda</a>
            <a href="<?= e(url('#tentang')) ?>">Tentang Kami</a>
            <div class="nav-dropdown">
                <button type="button" class="nav-dropdown-toggle" aria-expanded="false" data-dropdown-toggle>Produk <span>⌄</span></button>
                <div class="nav-dropdown-menu"><a href="<?= e(url('produk.php')) ?>">Produk Digital</a></div>
            </div>
            <div class="nav-dropdown">
                <button type="button" class="nav-dropdown-toggle" aria-expanded="false" data-dropdown-toggle>Kategori Berita <span>⌄</span></button>
                <div class="nav-dropdown-menu category-menu">
                    <?php foreach (['pilihan' => 'Berita Pilihan', 'politik' => 'Politik', 'crypto' => 'Crypto', 'meme' => 'Meme', 'meme_politik' => 'Meme Politik'] as $category => $label): ?>
                        <a href="<?= e(url('berita.php?kategori=' . $category)) ?>"><?= e($label) ?></a>
                    <?php endforeach; ?>
                </div>
            </div>
            <a href="<?= e(url('faq.php')) ?>">FAQ</a>
            <button type="button" class="icon-button" aria-label="Cari berita" data-search-toggle>⌕</button>
            <button type="button" class="icon-button" aria-label="Ganti tema" data-theme-toggle>◐</button>
        </nav>
    </div>
    <form class="search-panel container" action="<?= e(url('berita.php')) ?>" method="get" data-search-panel hidden>
        <input type="search" name="q" placeholder="Cari berita..." aria-label="Cari berita">
        <button class="button button-dark" type="submit">Cari</button>
    </form>
</header>
<main>
