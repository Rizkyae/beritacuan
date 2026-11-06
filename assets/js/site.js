(() => {
    const categories = [
        ['pilihan', 'Berita Pilihan'],
        ['politik', 'Politik'],
        ['crypto', 'Crypto'],
        ['meme', 'Meme'],
        ['meme_politik', 'Meme Politik']
    ];
    const header = document.querySelector('#site-header');
    const footer = document.querySelector('#site-footer');

    if (header) {
        header.innerHTML = `
            <header class="site-header">
                <div class="container nav-wrap">
                    <a class="brand" href="index.html" aria-label="BERITA CUAN beranda"><span class="brand-mark">B<span>.</span></span><span>BERITA <b>CUAN</b></span></a>
                    <button class="mobile-menu-button" type="button" aria-label="Buka navigasi" aria-expanded="false" data-menu-toggle>☰</button>
                    <nav class="main-nav" data-menu>
                        <a href="index.html">Beranda</a>
                        <a href="index.html#tentang">Tentang Kami</a>
                        <div class="nav-dropdown"><button type="button" class="nav-dropdown-toggle" aria-expanded="false" data-dropdown-toggle>Produk <span>⌄</span></button><div class="nav-dropdown-menu"><a href="produk.html">Produk Digital</a></div></div>
                        <div class="nav-dropdown"><button type="button" class="nav-dropdown-toggle" aria-expanded="false" data-dropdown-toggle>Kategori Berita <span>⌄</span></button><div class="nav-dropdown-menu category-menu">${categories.map(([key, label]) => `<a href="berita.html?kategori=${key}">${label}</a>`).join('')}</div></div>
                        <a href="faq.html">FAQ</a>
                        <button type="button" class="icon-button" aria-label="Cari berita" data-search-toggle>⌕</button>
                        <button type="button" class="icon-button" aria-label="Ganti tema" data-theme-toggle>◐</button>
                    </nav>
                </div>
                <form class="search-panel container" action="berita.html" method="get" data-search-panel hidden><input type="search" name="q" placeholder="Cari berita..." aria-label="Cari berita"><button class="button button-dark" type="submit">Cari</button></form>
            </header>`;
    }

    if (footer) {
        footer.innerHTML = `
            <footer class="site-footer">
                <div class="container footer-main">
                    <div><a class="brand" href="index.html"><span class="brand-mark">B<span>.</span></span><span>BERITA <b>CUAN</b></span></a><p>Berita tajam, konteks jelas, tanpa basa-basi.</p></div>
                    <div class="footer-links"><a href="berita.html">Berita</a><a href="produk.html">Produk Digital</a><a href="faq.html">FAQ</a></div>
                </div>
                <div class="container footer-bottom"><span>© ${new Date().getFullYear()} BERITA CUAN</span><span>Informasi untuk wawasan, bukan saran investasi.</span></div>
            </footer>`;
    }
})();
