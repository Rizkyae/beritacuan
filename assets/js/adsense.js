(() => {
    const config = window.BERITA_CUAN_ADSENSE;
    if (!config || !config.clientId || !config.slotId) return;
    if (!/^ca-pub-\d+$/.test(config.clientId) || !/^\d+$/.test(config.slotId)) {
        console.error('Konfigurasi Google AdSense tidak valid. Periksa clientId dan slotId.');
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.clientId)}`;
    script.onload = () => {
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
    };
    script.onerror = () => console.error('Skrip Google AdSense gagal dimuat.');
    document.head.append(script);
})();
