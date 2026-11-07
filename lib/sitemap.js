const siteUrl = 'https://www.beritacuan.my.id';
const supabaseUrl = 'https://kixjhtlakxrqzowpkhgs.supabase.co';
const supabaseAnonKey = 'sb_publishable_Zhcee5LNtx4hZ8SZX2rT5w_Xr7qmx3w';
const staticPages = [
    '/',
    '/berita.html',
    '/produk.html',
    '/faq.html',
    '/about.html',
    '/kebijakan-editorial.html',
    '/kebijakan-privasi.html'
];

async function getSitemapUrls() {
    const posts = [];
    const pageSize = 1000;
    for (let offset = 0; offset < 50000; offset += pageSize) {
        const url = new URL(`${supabaseUrl}/rest/v1/posts`);
        url.searchParams.set('select', 'slug,created_at');
        url.searchParams.set('order', 'created_at.desc');
        url.searchParams.set('limit', String(pageSize));
        url.searchParams.set('offset', String(offset));
        const result = await fetch(url, {
            headers: {
                apikey: supabaseAnonKey,
                Authorization: `Bearer ${supabaseAnonKey}`,
                Accept: 'application/json'
            }
        });
        if (!result.ok) {
            throw new Error(`Supabase posts request failed with HTTP ${result.status}.`);
        }
        const page = await result.json();
        if (!Array.isArray(page)) {
            throw new Error('Supabase returned an invalid posts response.');
        }
        posts.push(...page);
        if (page.length < pageSize) break;
    }

    return [
        ...staticPages.map((path) => `${siteUrl}${path}`),
        ...posts
            .filter((post) => typeof post.slug === 'string' && post.slug)
            .map((post) => `${siteUrl}/berita/${encodeURIComponent(post.slug)}`)
    ];
}

function xmlEscape(value) {
    return String(value).replace(/[<>&"']/g, (character) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;'
    })[character]);
}

module.exports = { getSitemapUrls, xmlEscape };
