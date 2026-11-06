(() => {
    const config = window.BERITA_CUAN_SUPABASE;
    const sessionKey = 'bc-admin-session';
    const categories = ['pilihan', 'politik', 'crypto', 'meme', 'meme_politik'];
    const categoryNames = {
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

    const message = (text, type = 'error') => {
        const element = document.querySelector('[data-admin-message]');
        if (!element) return;
        element.className = `alert alert-${type}`;
        element.textContent = text;
        element.hidden = false;
    };

    const getSession = () => {
        try {
            const session = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
            return session && typeof session.accessToken === 'string' ? session : null;
        } catch {
            return null;
        }
    };

    const getToken = () => getSession()?.accessToken || '';

    const clearSession = () => {
        sessionStorage.removeItem(sessionKey);
    };

    const authRequest = async (path, payload = null, token = '') => {
        if (!config.url || !config.anonKey) {
            throw new Error('Konfigurasi Supabase belum lengkap. Periksa assets/js/supabase.js.');
        }
        const response = await fetch(`${config.url.replace(/\/+$/, '')}/auth/v1/${path}`, {
            method: payload ? 'POST' : 'GET',
            headers: {
                apikey: config.anonKey,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(payload ? { 'Content-Type': 'application/json' } : {}),
                Accept: 'application/json'
            },
            ...(payload ? { body: JSON.stringify(payload) } : {})
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.msg || result?.message || result?.error_description || `Autentikasi gagal (HTTP ${response.status}).`);
        return result;
    };

    const request = async (path, { method = 'GET', body, token = getToken(), query = {}, prefer = 'return=representation' } = {}) => {
        if (!config.url || !config.anonKey) {
            throw new Error('Konfigurasi Supabase belum lengkap. Periksa assets/js/supabase.js.');
        }
        const url = new URL(`${config.url.replace(/\/+$/, '')}/rest/v1/${path}`);
        Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, String(value)));
        const response = await fetch(url, {
            method,
            headers: {
                apikey: config.anonKey,
                Authorization: `Bearer ${token || config.anonKey}`,
                Accept: 'application/json',
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                Prefer: prefer
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {})
        });
        const result = response.status === 204 ? null : await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.message || result?.msg || `Permintaan gagal (HTTP ${response.status}).`);
        return result;
    };

    const verifyAdmin = async () => {
        const session = getSession();
        if (!session) throw new Error('Sesi admin tidak ditemukan. Silakan login kembali.');
        let token = session.accessToken;
        let user;
        try {
            user = await authRequest('user', null, token);
        } catch (error) {
            if (!session.refreshToken) throw error;
            const refreshed = await authRequest('token?grant_type=refresh_token', { refresh_token: session.refreshToken });
            token = refreshed.access_token;
            user = refreshed.user;
            sessionStorage.setItem(sessionKey, JSON.stringify({
                accessToken: refreshed.access_token,
                refreshToken: refreshed.refresh_token
            }));
        }
        if (!user?.id) throw new Error('Sesi login tidak valid. Silakan login kembali.');
        const profiles = await request('profiles', {
            token,
            query: { select: 'role', id: `eq.${user.id}`, limit: '1' }
        });
        if (profiles?.[0]?.role !== 'admin') throw new Error('Akun ini tidak memiliki akses admin.');
        return { token, user };
    };

    const formatDate = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '-' : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
    };
    const formatMoney = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
    const pageNames = {
        dashboard: ['Ringkasan', 'dashboard.html'],
        posts: ['Berita & Meme', 'manage-posts.html'],
        products: ['Produk Digital', 'manage-products.html'],
        faqs: ['Kelola FAQ', 'manage-faqs.html']
    };

    function renderShell(page) {
        const current = pageNames[page] || pageNames.dashboard;
        document.querySelector('[data-admin-shell]').innerHTML = `
            <aside class="admin-sidebar">
                <a class="brand" href="../index.html"><span class="brand-mark">B<span>.</span></span><span>BERITA <b>CUAN</b></span></a>
                <nav>
                    ${Object.entries(pageNames).map(([key, value]) => `<a class="${key === page ? 'active' : ''}" href="${value[1]}">${value[0]}</a>`).join('')}
                    <a href="../index.html">← Lihat website</a>
                </nav>
            </aside>`;
        document.querySelector('[data-admin-content]').insertAdjacentHTML('afterbegin', `
            <div class="admin-top"><h1>${current[0]}</h1>
                <button class="button button-dark button-small" type="button" data-logout>Keluar</button>
            </div>
            <div data-admin-message hidden></div>`);
    }

    const postRows = (posts) => posts.map((post) => `
        <tr><td>${escapeHTML(post.title)}</td><td>${escapeHTML(categoryNames[post.category] || post.category)}</td>
            <td>${Number(post.views || 0).toLocaleString('id-ID')}</td><td>${escapeHTML(formatDate(post.created_at))}</td>
            <td><div class="inline-actions"><a class="button button-dark button-small" href="manage-posts.html?edit=${encodeURIComponent(post.id)}">Edit</a>
                <button class="button button-danger button-small" type="button" data-delete="posts" data-id="${escapeHTML(post.id)}">Hapus</button></div></td></tr>`).join('');

    async function initDashboard() {
        const content = document.querySelector('[data-admin-content]');
        try {
            const analytics = await request('rpc/admin_analytics', { method: 'POST', body: {} });
            const posts = await request('posts', { query: { select: 'id,title,category,views,created_at', order: 'created_at.desc', limit: '8' } });
            content.insertAdjacentHTML('beforeend', `
                <div class="stats-grid">
                    <div class="stat-card"><span>Total berita & meme</span><strong>${Number(analytics.total_posts || 0).toLocaleString('id-ID')}</strong></div>
                    <div class="stat-card"><span>Produk digital</span><strong>${Number(analytics.total_products || 0).toLocaleString('id-ID')}</strong></div>
                    <div class="stat-card"><span>Total pembacaan</span><strong>${Number(analytics.total_views || 0).toLocaleString('id-ID')}</strong></div>
                </div>
                <section class="admin-panel"><h2>Konten terbaru</h2><div class="data-table-wrap"><table class="data-table">
                    <thead><tr><th>Judul</th><th>Kategori</th><th>Views</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                    <tbody>${posts.length ? postRows(posts) : '<tr><td colspan="5">Belum ada konten.</td></tr>'}</tbody>
                </table></div></section>`);
        } catch (error) {
            message(error.message);
        }
    }

    const postForm = (post = {}) => `
        <section class="admin-panel"><h2>${post.id ? 'Edit konten' : 'Tambah konten'}</h2>
        <form data-record-form="posts" data-id="${escapeHTML(post.id || '')}">
            <div class="form-grid">
                <div class="field"><label for="title">Judul</label><input id="title" name="title" required maxlength="250" value="${escapeHTML(post.title || '')}"></div>
                <div class="field"><label for="slug">Slug (opsional)</label><input id="slug" name="slug" value="${escapeHTML(post.slug || '')}" pattern="[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*"></div>
                <div class="field"><label for="category">Kategori</label><select id="category" name="category">${categories.map((category) => `<option value="${category}" ${post.category === category ? 'selected' : ''}>${categoryNames[category]}</option>`).join('')}</select></div>
                <div class="field"><label for="thumbnail_url">URL gambar</label><input id="thumbnail_url" name="thumbnail_url" type="url" value="${escapeHTML(post.thumbnail_url || '')}"></div>
                <div class="field full"><label for="content">Isi berita</label><textarea id="content" name="content" required>${escapeHTML(post.content || '')}</textarea></div>
            </div><button class="button button-dark" type="submit">${post.id ? 'Simpan perubahan' : 'Terbitkan berita'}</button>
            ${post.id ? '<a class="button" href="manage-posts.html">Batal</a>' : ''}
        </form></section>`;

    async function initPosts() {
        const content = document.querySelector('[data-admin-content]');
        const editId = new URLSearchParams(location.search).get('edit');
        let editing = {};
        if (editId) {
            try {
                const records = await request('posts', { query: { select: '*', id: `eq.${editId}`, limit: '1' } });
                if (!records[0]) throw new Error('Berita yang dipilih tidak ditemukan.');
                editing = records[0];
            } catch (error) {
                message(error.message);
            }
        }
        content.insertAdjacentHTML('beforeend', postForm(editing));
        try {
            const posts = await request('posts', { query: { select: '*', order: 'created_at.desc', limit: '100' } });
            content.insertAdjacentHTML('beforeend', `<section class="admin-panel"><h2>Daftar konten</h2><div class="data-table-wrap"><table class="data-table">
                <thead><tr><th>Judul</th><th>Kategori</th><th>Views</th><th>Tanggal</th><th>Aksi</th></tr></thead>
                <tbody>${posts.length ? postRows(posts) : '<tr><td colspan="5">Belum ada konten.</td></tr>'}</tbody>
            </table></div></section>`);
        } catch (error) {
            message(error.message);
        }
    }

    const productRows = (products) => products.map((product) => `
        <tr><td>${escapeHTML(product.name)}</td><td>${escapeHTML(formatMoney(product.price))}</td>
            <td><div class="inline-actions"><a class="button button-dark button-small" href="manage-products.html?edit=${encodeURIComponent(product.id)}">Edit</a>
                <button class="button button-danger button-small" type="button" data-delete="digital_products" data-id="${escapeHTML(product.id)}">Hapus</button></div></td></tr>`).join('');

    async function initProducts() {
        const content = document.querySelector('[data-admin-content]');
        const editId = new URLSearchParams(location.search).get('edit');
        let product = {};
        if (editId) {
            try {
                const records = await request('digital_products', { query: { select: '*', id: `eq.${editId}`, limit: '1' } });
                if (!records[0]) throw new Error('Produk yang dipilih tidak ditemukan.');
                product = records[0];
            } catch (error) {
                message(error.message);
            }
        }
        content.insertAdjacentHTML('beforeend', `
            <section class="admin-panel"><h2>${product.id ? 'Edit produk' : 'Tambah produk'}</h2>
                <form data-record-form="digital_products" data-id="${escapeHTML(product.id || '')}">
                    <div class="form-grid">
                        <div class="field"><label for="name">Nama produk</label><input id="name" name="name" required maxlength="250" value="${escapeHTML(product.name || '')}"></div>
                        <div class="field"><label for="price">Harga (IDR)</label><input id="price" name="price" type="number" min="0" step="1" required value="${escapeHTML(product.price ?? '')}"></div>
                        <div class="field"><label for="file_url">URL pembelian/file</label><input id="file_url" name="file_url" type="url" value="${escapeHTML(product.file_url || '')}"></div>
                        <div class="field"><label for="thumbnail_url">URL thumbnail</label><input id="thumbnail_url" name="thumbnail_url" type="url" value="${escapeHTML(product.thumbnail_url || '')}"></div>
                        <div class="field full"><label for="description">Deskripsi</label><textarea id="description" name="description">${escapeHTML(product.description || '')}</textarea></div>
                    </div><button class="button button-dark" type="submit">${product.id ? 'Simpan perubahan' : 'Tambah produk'}</button>
                    ${product.id ? '<a class="button" href="manage-products.html">Batal</a>' : ''}
                </form>
            </section>`);
        try {
            const products = await request('digital_products', { query: { select: '*', order: 'created_at.desc' } });
            content.insertAdjacentHTML('beforeend', `<section class="admin-panel"><h2>Daftar produk</h2><div class="data-table-wrap"><table class="data-table">
                <thead><tr><th>Nama</th><th>Harga</th><th>Aksi</th></tr></thead><tbody>${products.length ? productRows(products) : '<tr><td colspan="3">Belum ada produk.</td></tr>'}</tbody>
            </table></div></section>`);
        } catch (error) {
            message(error.message);
        }
    }

    const faqRows = (faqs) => faqs.map((faq) => `
        <tr><td>${escapeHTML(faq.question)}</td><td>${Number(faq.order_num)}</td>
            <td><div class="inline-actions"><a class="button button-dark button-small" href="manage-faqs.html?edit=${encodeURIComponent(faq.id)}">Edit</a>
                <button class="button button-danger button-small" type="button" data-delete="faqs" data-id="${escapeHTML(faq.id)}">Hapus</button></div></td></tr>`).join('');

    async function initFaqs() {
        const content = document.querySelector('[data-admin-content]');
        const editId = new URLSearchParams(location.search).get('edit');
        let faq = {};
        if (editId) {
            try {
                const records = await request('faqs', { query: { select: '*', id: `eq.${editId}`, limit: '1' } });
                if (!records[0]) throw new Error('FAQ yang dipilih tidak ditemukan.');
                faq = records[0];
            } catch (error) {
                message(error.message);
            }
        }
        content.insertAdjacentHTML('beforeend', `
            <section class="admin-panel"><h2>${faq.id ? 'Edit FAQ' : 'Tambah FAQ'}</h2>
                <form data-record-form="faqs" data-id="${escapeHTML(faq.id || '')}">
                    <div class="field"><label for="question">Pertanyaan</label><input id="question" name="question" required maxlength="500" value="${escapeHTML(faq.question || '')}"></div>
                    <div class="field"><label for="answer">Jawaban</label><textarea id="answer" name="answer" required>${escapeHTML(faq.answer || '')}</textarea></div>
                    <div class="field"><label for="order_num">Urutan</label><input id="order_num" name="order_num" type="number" min="0" step="1" required value="${escapeHTML(faq.order_num ?? 0)}"></div>
                    <button class="button button-dark" type="submit">${faq.id ? 'Simpan perubahan' : 'Tambah FAQ'}</button>
                    ${faq.id ? '<a class="button" href="manage-faqs.html">Batal</a>' : ''}
                </form>
            </section>`);
        try {
            const faqs = await request('faqs', { query: { select: '*', order: 'order_num.asc' } });
            content.insertAdjacentHTML('beforeend', `<section class="admin-panel"><h2>Daftar FAQ</h2><div class="data-table-wrap"><table class="data-table">
                <thead><tr><th>Pertanyaan</th><th>Urutan</th><th>Aksi</th></tr></thead><tbody>${faqs.length ? faqRows(faqs) : '<tr><td colspan="3">Belum ada FAQ.</td></tr>'}</tbody>
            </table></div></section>`);
        } catch (error) {
            message(error.message);
        }
    }

    const collectData = (form) => {
        const fields = new FormData(form);
        const table = form.dataset.recordForm;
        if (table === 'posts') {
            const title = String(fields.get('title') || '').trim();
            const enteredSlug = String(fields.get('slug') || '').trim();
            const slug = (enteredSlug || title).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const category = String(fields.get('category') || '');
            const thumbnail = String(fields.get('thumbnail_url') || '').trim();
            if (!categories.includes(category) || !slug) throw new Error('Kategori dan slug harus valid.');
            if (thumbnail && !/^https?:\/\//i.test(thumbnail)) throw new Error('URL gambar harus diawali http:// atau https://.');
            return { title, slug, content: String(fields.get('content') || '').trim(), category, thumbnail_url: thumbnail || null };
        }
        if (table === 'digital_products') {
            const price = Number(fields.get('price'));
            if (!Number.isFinite(price) || price < 0) throw new Error('Harga produk tidak valid.');
            const thumbnail = String(fields.get('thumbnail_url') || '').trim();
            const fileUrl = String(fields.get('file_url') || '').trim();
            if (thumbnail && !/^https?:\/\//i.test(thumbnail)) throw new Error('URL thumbnail tidak valid.');
            if (fileUrl && !/^https?:\/\//i.test(fileUrl)) throw new Error('URL produk tidak valid.');
            return {
                name: String(fields.get('name') || '').trim(),
                description: String(fields.get('description') || '').trim(),
                price,
                file_url: fileUrl || null,
                thumbnail_url: thumbnail || null
            };
        }
        const order = Number(fields.get('order_num'));
        if (!Number.isInteger(order) || order < 0) throw new Error('Urutan FAQ tidak valid.');
        return {
            question: String(fields.get('question') || '').trim(),
            answer: String(fields.get('answer') || '').trim(),
            order_num: order
        };
    };

    async function handleSubmit(event) {
        const form = event.target.closest('[data-record-form]');
        if (!form) return;
        event.preventDefault();
        const submit = form.querySelector('button[type="submit"]');
        submit.disabled = true;
        try {
            const table = form.dataset.recordForm;
            const body = collectData(form);
            const id = form.dataset.id;
            await request(table, {
                method: id ? 'PATCH' : 'POST',
                body,
                query: id ? { id: `eq.${id}` } : {}
            });
            window.location.href = table === 'posts' ? 'manage-posts.html' : table === 'digital_products' ? 'manage-products.html' : 'manage-faqs.html';
        } catch (error) {
            message(error.message);
            submit.disabled = false;
        }
    }

    async function handleDelete(event) {
        const button = event.target.closest('[data-delete]');
        if (!button || !window.confirm('Hapus item ini? Tindakan ini tidak dapat dibatalkan.')) return;
        button.disabled = true;
        try {
            await request(button.dataset.delete, { method: 'DELETE', query: { id: `eq.${button.dataset.id}` } });
            window.location.reload();
        } catch (error) {
            message(error.message);
            button.disabled = false;
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const submit = form.querySelector('button[type="submit"]');
        submit.disabled = true;
        try {
            const fields = new FormData(form);
            const auth = await authRequest('token?grant_type=password', {
                email: String(fields.get('email') || '').trim(),
                password: String(fields.get('password') || '')
            });
            if (!auth.access_token || !auth.user?.id) throw new Error('Autentikasi tidak mengembalikan sesi yang valid.');
            const profile = await request('profiles', {
                token: auth.access_token,
                query: { select: 'role', id: `eq.${auth.user.id}`, limit: '1' }
            });
            if (profile?.[0]?.role !== 'admin') {
                await authRequest('logout', {}, auth.access_token).catch(() => {});
                throw new Error('Akun ini tidak memiliki akses admin.');
            }
            sessionStorage.setItem(sessionKey, JSON.stringify({ accessToken: auth.access_token, refreshToken: auth.refresh_token }));
            window.location.href = 'dashboard.html';
        } catch (error) {
            message(error.message);
            submit.disabled = false;
        }
    }

    async function handleLogout() {
        const token = getToken();
        try {
            if (token) await authRequest('logout', {}, token);
        } catch (error) {
            console.error('Sesi server tidak dapat ditutup:', error);
        } finally {
            clearSession();
            window.location.href = 'login.html';
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const page = document.body.dataset.adminPage;
        const year = document.querySelector('[data-current-year]');
        if (year) year.textContent = String(new Date().getFullYear());

        if (page === 'login') {
            document.querySelector('[data-login-form]').addEventListener('submit', handleLogin);
            if (getToken()) {
                try {
                    await verifyAdmin();
                    window.location.replace('dashboard.html');
                } catch {
                    clearSession();
                }
            }
            return;
        }

        renderShell(page);
        document.querySelector('[data-admin-content]').addEventListener('submit', handleSubmit);
        document.querySelector('[data-admin-content]').addEventListener('click', handleDelete);
        document.querySelector('[data-logout]').addEventListener('click', handleLogout);

        try {
            await verifyAdmin();
            document.querySelector('[data-admin-content] .empty-state')?.remove();
            if (page === 'dashboard') await initDashboard();
            if (page === 'posts') await initPosts();
            if (page === 'products') await initProducts();
            if (page === 'faqs') await initFaqs();
        } catch (error) {
            clearSession();
            message(error.message);
            window.setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        }
    });
})();
