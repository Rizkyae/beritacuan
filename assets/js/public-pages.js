(() => {
    const api = window.BERITA_CUAN_API;
    const categoryLabels = {
        pilihan: 'Berita Pilihan',
        politik: 'Politik',
        crypto: 'Crypto',
        meme: 'Meme',
        meme_politik: 'Meme Politik'
    };

    const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

    const safeImage = (source, alt = '') => {
        if (!source) return '';
        try {
            const imageUrl = new URL(source, window.location.href);
            if (!['http:', 'https:'].includes(imageUrl.protocol)) return '';
            return `<img src="${escapeHTML(imageUrl.href)}" alt="${escapeHTML(alt)}" loading="lazy">`;
        } catch {
            return '';
        }
    };

    const safeLink = (source) => {
        if (!source) return '';
        try {
            const link = new URL(source, window.location.href);
            return ['http:', 'https:'].includes(link.protocol) ? link.href : '';
        } catch {
            return '';
        }
    };

    const label = (category) => categoryLabels[category] || 'Berita';
    const dateLabel = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    };
    const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
    const readTime = (content) => `${Math.max(1, Math.ceil(String(content || '').trim().split(/\s+/).filter(Boolean).length / 220))} menit baca`;
    const excerpt = (content, length = 130) => {
        const text = String(content || '').replace(/\s+/g, ' ').trim();
        return text.length > length ? `${text.slice(0, length)}…` : text;
    };
    const showState = (target, message) => {
        if (target) target.innerHTML = `<div class="empty-state">${escapeHTML(message)}</div>`;
    };
    const postUrl = (post) => `/berita/${encodeURIComponent(post.slug || '')}`;
    const setMeta = (selector, attribute, value) => {
        let element = document.head.querySelector(selector);
        if (!element) {
            element = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
            if (selector.startsWith('meta[property=')) element.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
            else if (selector.startsWith('meta[name=')) element.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
            document.head.append(element);
        }
        element.setAttribute(attribute, value);
    };

    const setArticleMetadata = (post) => {
        const description = String(post.meta_description || excerpt(post.content, 160));
        const canonical = new URL(postUrl(post), window.location.href).href;
        const image = safeLink(post.thumbnail_url);
        document.title = `${post.title} — BERITA CUAN`;
        setMeta('meta[name="description"]', 'content', description);
        setMeta('meta[property="og:type"]', 'content', 'article');
        setMeta('meta[property="og:title"]', 'content', document.title);
        setMeta('meta[property="og:description"]', 'content', description);
        setMeta('meta[property="og:url"]', 'content', canonical);
        if (image) setMeta('meta[property="og:image"]', 'content', image);
        setMeta('meta[name="twitter:card"]', 'content', image ? 'summary_large_image' : 'summary');
        setMeta('meta[name="twitter:title"]', 'content', document.title);
        setMeta('meta[name="twitter:description"]', 'content', description);
        setMeta('link[rel="canonical"]', 'href', canonical);
        let structuredData = document.querySelector('[data-article-schema]');
        if (!structuredData) {
            structuredData = document.createElement('script');
            structuredData.type = 'application/ld+json';
            structuredData.dataset.articleSchema = '';
            document.head.append(structuredData);
        }
        structuredData.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: post.title,
            description,
            datePublished: post.created_at,
            dateModified: post.created_at,
            mainEntityOfPage: canonical,
            ...(image ? { image: [image] } : {}),
            author: { '@type': 'Organization', name: 'BERITA CUAN' },
            publisher: { '@type': 'Organization', name: 'BERITA CUAN', url: 'https://www.beritacuan.my.id/' }
        });
    };

    const renderPostCard = (post) => `
        <article class="news-card">
            <a class="news-card-image" href="${escapeHTML(postUrl(post))}">${safeImage(post.thumbnail_url, post.title || '') || `<div class="image-fallback">${escapeHTML(label(post.category))}</div>`}</a>
            <div class="news-card-body">
                <div class="eyebrow-row"><span class="category-pill">${escapeHTML(label(post.category))}</span><span>${escapeHTML(readTime(post.content))}</span></div>
                <h3><a href="${escapeHTML(postUrl(post))}">${escapeHTML(post.title)}</a></h3>
                <p>${escapeHTML(excerpt(post.content))}</p>
                <div class="card-meta"><span>${escapeHTML(dateLabel(post.created_at))}</span><span>${Number(post.views || 0).toLocaleString('id-ID')} dibaca</span></div>
            </div>
        </article>`;

    const renderProductCard = (product, compact = false) => {
        const image = safeImage(product.thumbnail_url, product.name || '');
        return `<article class="product-card">${image ? `<div style="height:170px;overflow:hidden;border-radius:10px">${image}</div>` : '<div class="product-icon">↗</div>'}
            <span class="category-pill" style="margin-top:16px">Produk digital</span>
            <h3>${escapeHTML(product.name)}</h3><p>${escapeHTML(product.description)}</p>
            <div class="product-price">${escapeHTML(money(product.price))}</div>
            <a class="button button-green" href="produk.html">${compact ? 'Lihat produk' : 'Beli Sekarang'} →</a>
        </article>`;
    };

    const renderFaqs = (faqs, idPrefix) => faqs.map((faq, index) => {
        const id = `${idPrefix}-${index}`;
        return `<div class="faq-item">
            <button class="faq-question" type="button" data-faq-button aria-expanded="false" aria-controls="${id}">
                <span>${escapeHTML(faq.question)}</span><span data-faq-icon>+</span>
            </button>
            <div class="faq-answer" id="${id}" hidden>${escapeHTML(faq.answer).replace(/\r?\n/g, '<br>')}</div>
        </div>`;
    }).join('');

    async function initHome() {
        const feature = document.querySelector('[data-home-feature]');
        const cryptoTarget = document.querySelector('[data-home-crypto]');
        const politicsTarget = document.querySelector('[data-home-politics]');
        const memesTarget = document.querySelector('[data-home-memes]');
        const productsTarget = document.querySelector('[data-home-products]');
        const faqsTarget = document.querySelector('[data-home-faqs]');

        try {
            const posts = await api.select('posts', { select: '*', order: 'created_at.desc', limit: '30' });
            const selected = posts.filter((post) => post.category === 'pilihan');
            const featured = (selected.length ? selected : posts).slice(0, 3);
            if (feature) {
                if (!featured.length) {
                    showState(feature, 'Belum ada berita. Konten yang ditambahkan admin akan muncul di sini.');
                } else {
                    const lead = featured[0];
                    feature.innerHTML = `<article class="hero-feature">${safeImage(lead.thumbnail_url, lead.title || '')}
                        <div class="hero-feature-content"><span class="category-pill">${escapeHTML(label(lead.category))}</span>
                        <h2><a href="${escapeHTML(postUrl(lead))}">${escapeHTML(lead.title)}</a></h2>
                        <div class="card-meta"><span>${escapeHTML(dateLabel(lead.created_at))}</span><span>${Number(lead.views || 0).toLocaleString('id-ID')} dibaca</span></div></div></article>
                        <div class="hero-side">${featured.slice(1).map((post) => `<article class="hero-mini">
                            <a class="hero-mini-image" href="${escapeHTML(postUrl(post))}">${safeImage(post.thumbnail_url, post.title || '')}</a>
                            <div><span class="category-pill">${escapeHTML(label(post.category))}</span>
                            <h3><a href="${escapeHTML(postUrl(post))}">${escapeHTML(post.title)}</a></h3>
                            <span class="card-meta">${escapeHTML(dateLabel(post.created_at))}</span></div></article>`).join('')}
                            ${featured.length < 2 ? '<div class="hero-mini"><div><span class="category-pill">CERDAS FINANSIAL</span><h3>Ikuti perkembangan pasar dengan perspektif yang lebih jernih.</h3><a class="text-link" href="berita.html?kategori=crypto">Baca update pasar →</a></div></div>' : ''}</div>`;
                }
            }

            const cryptoPosts = posts.filter((post) => post.category === 'crypto').slice(0, 3);
            cryptoTarget.innerHTML = cryptoPosts.length ? cryptoPosts.map(renderPostCard).join('') : '<div class="empty-state">Update crypto akan muncul di sini saat tersedia.</div>';
            const politics = posts.filter((post) => post.category === 'politik').slice(0, 3);
            politicsTarget.innerHTML = politics.length ? politics.map(renderPostCard).join('') : '<div class="empty-state">Belum ada berita politik terbaru.</div>';
            const memes = posts.filter((post) => ['meme', 'meme_politik'].includes(post.category)).slice(0, 3);
            memesTarget.innerHTML = memes.length ? memes.map((post) => `<article class="meme-card">
                ${safeImage(post.thumbnail_url, post.title || '') || '<div class="image-fallback" style="height:240px">Meme BERITA CUAN</div>'}
                <div class="meme-content"><span class="category-pill">${escapeHTML(label(post.category))}</span>
                <h3><a href="${escapeHTML(postUrl(post))}">${escapeHTML(post.title)}</a></h3>
                <button class="reaction-button" type="button" data-reaction="${escapeHTML(post.id)}" data-likes="0" aria-pressed="false">♡ <span data-reaction-count>0</span> suka</button></div></article>`).join('') : '<div class="empty-state">Meme segar segera hadir. Kirimkan ide Anda melalui kanal resmi kami.</div>';
        } catch (error) {
            [feature, cryptoTarget, politicsTarget, memesTarget].forEach((target) => showState(target, error.message));
        }

        try {
            const products = await api.select('digital_products', { select: '*', order: 'created_at.desc', limit: '3' });
            productsTarget.innerHTML = products.length ? products.map((product) => renderProductCard(product, true)).join('') : '<div class="empty-state">Produk digital akan tampil setelah ditambahkan oleh admin.</div>';
        } catch (error) {
            showState(productsTarget, error.message);
        }

        try {
            const faqs = await api.select('faqs', { select: '*', order: 'order_num.asc', limit: '4' });
            faqsTarget.innerHTML = faqs.length ? renderFaqs(faqs, 'home-faq') : '<div class="empty-state">FAQ belum tersedia.</div>';
        } catch (error) {
            showState(faqsTarget, error.message);
        }
    }

    async function initNews() {
        const params = new URLSearchParams(window.location.search);
        const pathMatch = window.location.pathname.match(/^\/berita\/([^/]+)\/?$/);
        let pathSlug = '';
        if (pathMatch) {
            try {
                pathSlug = decodeURIComponent(pathMatch[1]);
            } catch {
                pathSlug = '';
            }
        }
        const slug = params.get('slug') || pathSlug;
        const category = params.get('kategori') || '';
        const search = params.get('q') || '';
        const article = document.querySelector('[data-article]');
        const list = document.querySelector('[data-news-list]');

        if (slug) {
            list.hidden = true;
            article.hidden = false;
            article.innerHTML = '<div class="empty-state">Memuat berita...</div>';
            try {
                const rows = await api.select('posts', { select: '*', slug: `eq.${slug}`, limit: '1' });
                const post = rows[0];
                if (!post) {
                    showState(article, 'Berita tidak ditemukan atau belum tersedia.');
                    return;
                }
                try {
                    await api.rpc('increment_post_views', { post_slug: slug });
                    post.views = Number(post.views || 0) + 1;
                } catch (error) {
                    console.error('Penghitung views gagal:', error);
                }
                setArticleMetadata(post);
                article.innerHTML = `<a class="category-pill" href="berita.html?kategori=${encodeURIComponent(post.category)}">${escapeHTML(label(post.category))}</a>
                    <h1>${escapeHTML(post.title)}</h1>
                    <div class="article-meta">${escapeHTML(dateLabel(post.created_at))} · ${escapeHTML(readTime(post.content))} · ${Number(post.views || 0).toLocaleString('id-ID')} dibaca</div>
                    ${safeImage(post.thumbnail_url, post.title || '')}
                    <div class="article-content">${escapeHTML(post.content).replace(/\r?\n/g, '<br>')}</div>
                    <p class="article-meta">Konten ini disediakan untuk informasi dan edukasi; bukan saran investasi.</p>`;
            } catch (error) {
                showState(article, error.message);
            }
            return;
        }

        let query = { select: '*', order: 'created_at.desc', limit: '30' };
        const categoryIsValid = Object.hasOwn(categoryLabels, category);
        if (categoryIsValid) query.category = `eq.${category}`;
        if (search) query.title = `ilike."*${search.replace(/[\\"]/g, '')}*"`;
        document.querySelectorAll('[data-category]').forEach((chip) => {
            chip.classList.toggle('active', chip.dataset.category === (categoryIsValid ? category : ''));
        });
        if (search) {
            document.querySelector('[data-news-title]').textContent = 'Hasil pencarian';
            document.querySelector('[data-news-description]').textContent = `Hasil pencarian untuk “${search}”.`;
        } else if (categoryIsValid) {
            document.querySelector('[data-news-title]').textContent = label(category);
        }
        document.title = `${search ? 'Hasil pencarian' : categoryIsValid ? label(category) : 'Semua berita'} — BERITA CUAN`;

        const target = document.querySelector('[data-news-results]');
        try {
            const posts = await api.select('posts', query);
            target.innerHTML = posts.length ? posts.map(renderPostCard).join('') : '<div class="empty-state">Tidak ada berita yang cocok saat ini.</div>';
        } catch (error) {
            showState(target, error.message);
        }
    }

    async function initProducts() {
        const target = document.querySelector('[data-products]');
        try {
            const products = await api.select('digital_products', { select: '*', order: 'created_at.desc' });
            if (!products.length) {
                showState(target, 'Produk digital belum tersedia.');
                return;
            }
            const number = window.BERITA_CUAN_SUPABASE.whatsappNumber.replace(/\D/g, '');
            target.innerHTML = products.map((product) => {
                const text = encodeURIComponent(`Halo, saya tertarik dengan produk ${product.name}.`);
                const purchaseUrl = number ? `https://wa.me/${number}?text=${text}` : safeLink(product.file_url);
                const action = purchaseUrl
                    ? `<a class="button button-green" href="${escapeHTML(purchaseUrl)}" ${purchaseUrl.startsWith('https://') ? 'target="_blank" rel="noopener noreferrer"' : ''}>Beli Sekarang ↗</a>`
                    : '<span class="button button-green" aria-disabled="true">Hubungi admin untuk membeli</span>';
                return `<article class="product-card">${safeImage(product.thumbnail_url, product.name || '') || '<div class="product-icon">↗</div>'}
                    <span class="category-pill" style="margin-top:16px">Produk digital</span><h3>${escapeHTML(product.name)}</h3>
                    <p>${escapeHTML(product.description).replace(/\r?\n/g, '<br>')}</p><div class="product-price">${escapeHTML(money(product.price))}</div>${action}</article>`;
            }).join('');
        } catch (error) {
            showState(target, error.message);
        }
    }

    async function initFaq() {
        const target = document.querySelector('[data-faq-list]');
        try {
            const faqs = await api.select('faqs', { select: '*', order: 'order_num.asc' });
            target.innerHTML = faqs.length ? renderFaqs(faqs, 'faq') : '<div class="empty-state">FAQ belum tersedia.</div>';
        } catch (error) {
            showState(target, error.message);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const page = document.body.dataset.page;
        if (page === 'home') void initHome();
        if (page === 'news') void initNews();
        if (page === 'products') void initProducts();
        if (page === 'faq') void initFaq();
    });
})();
