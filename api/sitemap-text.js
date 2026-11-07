const { getSitemapUrls } = require('../lib/sitemap');

module.exports = async function handler(request, response) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.setHeader('Allow', 'GET, HEAD');
        return response.status(405).send('Method not allowed');
    }

    try {
        const urls = await getSitemapUrls();
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
        if (request.method === 'HEAD') return response.status(200).end();
        return response.status(200).send(`${urls.join('\n')}\n`);
    } catch (error) {
        console.error('Text sitemap generation failed:', error);
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return response.status(500).send('Sitemap generation failed.');
    }
};
