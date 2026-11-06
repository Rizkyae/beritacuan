(() => {
    const config = window.BERITA_CUAN_ADSENSE;
    if (!config || !config.clientId) return;
    if (!/^ca-pub-\d+$/.test(config.clientId) || (config.slotId && !/^\d+$/.test(config.slotId))) {
        console.error('Konfigurasi Google AdSense tidak valid. Periksa clientId dan slotId.');
        return;
    }

    if (!config.slotId) return;
    document.querySelectorAll('[data-adsense-slot]').forEach((container) => {
        const ad = document.createElement('ins');
        ad.className = 'adsbygoogle';
        ad.style.display = 'block';
        ad.dataset.adClient = config.clientId;
        ad.dataset.adSlot = config.slotId;
        ad.dataset.adFormat = 'auto';
        ad.dataset.fullWidthResponsive = 'true';
        container.replaceChildren(ad);
        container.hidden = false;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
})();
