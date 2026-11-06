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

const xmlEscape = (value) => String(value).replace(/[<>&"']/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;'
})[character]);

module.exports = async function handler(request, response) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.setHeader('Allow', 'GET, HEAD');
        return response.status(405).send('Method not allowed');
    }

    try {
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

        const urls = staticPages.map((path) => `  <url><loc>${xmlEscape(`${siteUrl}${path}`)}</loc></url>`);
        for (const post of posts) {
            if (typeof post.slug !== 'string' || !post.slug) continue;
            const articleUrl = `${siteUrl}/berita.html?slug=${encodeURIComponent(post.slug)}`;
            const lastModified = post.created_at ? `<lastmod>${xmlEscape(new Date(post.created_at).toISOString())}</lastmod>` : '';
            urls.push(`  <url><loc>${xmlEscape(articleUrl)}</loc>${lastModified}</url>`);
        }

        response.setHeader('Content-Type', 'application/xml; charset=utf-8');
        response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
        if (request.method === 'HEAD') return response.status(200).end();
        return response.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
    } catch (error) {
        console.error('Sitemap generation failed:', error);
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return response.status(500).send('Sitemap generation failed.');
    }
};
